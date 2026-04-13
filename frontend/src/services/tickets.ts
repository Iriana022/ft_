import api from './api';
import {type ChatMessage, TicketStatus, type Ticket, type User} from '../types';
import {TicketPriority, type TicketType} from '../types';
import {type TicketInternalNote} from '../types';

export type RawUser = Omit<User, 'createdAt'> & {
	createdAt: string | Date;
	ticketsCreated?: RawTicket[];
};

export type RawTicket = Omit<Ticket, 'createdAt' | 'updatedAt' | 'author' | 'assignedTo' | 'assignedToId'> & {
	createdAt: string | Date;
	updatedAt: string | Date;
	author: RawUser;
	assignedTo?: RawUser;
	AssignedTo?: RawUser;
	assignedToId?: number;
	AssignedToId?: number;
	clientUnreadCount?: number;
	agentUnreadCount?: number;
};

const uploadsApiPrefix = '/api/uploads/';

const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const normalizeAvatarUrl = (avatar?: string | null) => {
	if (!avatar) return undefined;

	const value = avatar.trim();
	if (!value) return undefined;

	if (isAbsoluteHttpUrl(value)) return value;
	if (value.startsWith('/assets/')) return value;
	if (value.startsWith(uploadsApiPrefix)) return value;
	if (value.startsWith('/uploads/')) return '/api' + value;
	if (value.startsWith('/')) return value;

	return uploadsApiPrefix + value;
};

const normalizeUser = (user: RawUser): User => {
	if (!user) return user;

	return {
		...user,
		avatar: normalizeAvatarUrl(user.avatar),
		createdAt: new Date(user.createdAt),
		ticketsCreated: Array.isArray(user.ticketsCreated)
			? user.ticketsCreated.map((ticket) => {
				return {
					...normalizeTicket(ticket),
					author: user as unknown as User,
				};
			})
			: [],
	};
};

export type RawTicketInternalNote = Omit<TicketInternalNote, 'createdAt' | 'author'> & {
	createdAt: string | Date;
	author: RawUser;
};

export type RawTicketResolutionHistoryItem = {
	ticketId: number;
	toStatus: TicketStatus;
	changedAt: string | Date;
};

export type TicketResolutionHistoryItem = {
	ticketId: number;
	toStatus: TicketStatus;
	changedAt: Date;
};

export const fetchTicketResolutionHistory = async (
	days = 7
): Promise<TicketResolutionHistoryItem[]> => {
	const response = await api.get('/tickets/stats/resolution-history', {
		params: {days},
	});

	return (response.data ?? []).map((item: RawTicketResolutionHistoryItem) => ({
		...item,
		changedAt: new Date(item.changedAt),
	}));
};

const normalizeInternalNote = (note: RawTicketInternalNote): TicketInternalNote => ({
	...note,
	createdAt: new Date(note.createdAt),
	author: normalizeUser(note.author),
});

export const normalizeTicket = (ticket: RawTicket): Ticket => {
	const assignedTo = ticket.assignedTo ?? ticket.AssignedTo;

	return {
		...ticket,
		createdAt: new Date(ticket.createdAt),
		updatedAt: new Date(ticket.updatedAt),
		author: normalizeUser(ticket.author),
		assignedTo: assignedTo ? normalizeUser(assignedTo) : undefined,
		assignedToId: ticket.assignedToId ?? ticket.AssignedToId,
		clientUnreadCount: ticket.clientUnreadCount ?? 0,
		agentUnreadCount: ticket.agentUnreadCount ?? 0,
	};
};

export const sortTicketsForAgent = (tickets: Ticket[]): Ticket[] => {
	return [...tickets].sort((a, b) => {
		const aClosed = a.status === TicketStatus.CLOSED;
		const bClosed = b.status === TicketStatus.CLOSED;

		if (aClosed !== bClosed) return aClosed ? 1 : -1;

		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});
};

export const fetchTickets = async (): Promise<Ticket[]> => {
	const response = await api.get('/tickets');
	const rawTickets = (response.data ?? []) as RawTicket[];

	return rawTickets.map(normalizeTicket);
};

export const fetchTicketById = async (ticketId: number): Promise<Ticket> => {
	const tickets = await fetchTickets();
	const ticket = tickets.find((t) => t.id === ticketId);

	if (!ticket) {
		throw new Error('Ticket introuvable');
	}
	return ticket;
};

export const fetchUsers = async (): Promise<User[]> => {
	const response = await api.get('/user');
	const rawUsers = (response.data ?? []) as RawUser[];

	return rawUsers.map(normalizeUser);
};

export const deleteUserByAdmin = async (userId: number): Promise<void> => {
	await api.delete('/user/' + userId);
};

export const getTicketInternalNotes = async (ticketId: number): Promise<TicketInternalNote[]> => {
	const response = await api.get('/tickets/' + ticketId + '/internal-notes');
	return (response.data ?? []).map((note: RawTicketInternalNote) => normalizeInternalNote(note));
};

export const createTicketInternalNote = async (
	ticketId: number,
	content: string,
): Promise<TicketInternalNote> => {
	const response = await api.post('/tickets/' + ticketId + '/internal-notes', {content});
	return normalizeInternalNote(response.data as RawTicketInternalNote);
};

export const updateTicketStatus = async (ticketId: number, status: TicketStatus): Promise<Ticket> => {
	const response = await api.patch(`/tickets/${ticketId}/status`, {status});

	return normalizeTicket(response.data as RawTicket);
};

const mapTicketToClientTicket = (ticket: Ticket): TicketType => ({
	id: ticket.id,
	title: ticket.title,
	description: ticket.description,
	status: ticket.status,
	priority: ticket.priority,
	clientUnreadCount: ticket.clientUnreadCount,
	hasMessage: ticket.clientUnreadCount > 0,
});

export const markTicketMessagesAsRead = async (ticketId: number) => {
	const response = await api.patch('/tickets/' + ticketId + '/read');
	return response.data as {
		id: number;
		clientUnreadCount: number;
		agentUnreadCount: number;
	};
};

export const fetchMyTicketsForClientView = async (): Promise<TicketType[]> => {
	const response = await api.get('/tickets/my');
	const rawTickets = (response.data ?? []) as RawTicket[];

	return rawTickets.map(normalizeTicket).map(mapTicketToClientTicket);
};

export const createClientTicket = async (payload: {
	title: string;
	description: string;
	priority?: TicketPriority;
}): Promise<TicketType> => {
	const response = await api.post('/tickets', payload);
	const normalized = normalizeTicket(response.data as RawTicket);

	return mapTicketToClientTicket(normalized);
};

export const getTicketStats = (tickets: Ticket[]) => ({
	total: tickets.length,
	open: tickets.filter((ticket) => ticket.status === TicketStatus.OPEN).length,
	inProgress: tickets.filter((ticket) => ticket.status === TicketStatus.IN_PROGRESS).length,
	resolved: tickets.filter((t) => t.status === TicketStatus.RESOLVED).length,
});

export const getTicketMessages = async (ticketId: number): Promise<ChatMessage[]> => {
	const response = await api.get(`/tickets/${ticketId}/messages`);
	return response.data.map((msg: any) => ({
		...msg,
		createdAt: new Date(msg.createdAt),
	}));
};

export const sendTicketMessage = async (
	ticketId: number,
	content: string,
	isFromSupport: boolean
): Promise<ChatMessage> => {
	const response = await api.post(`/tickets/${ticketId}/messages`, {
		content,
		isFromSupport,
	});
	return {
		...response.data,
		createdAt: new Date(response.data.createdAt),
	};
};

export type RawNotification = {
	id: number;
	code:
	| 'NEW_CLIENT_TICKET'
	| 'USER_PROFILE_UPDATED'
	| 'USER_LOGGED_IN'
	| 'TICKET_STATUS_UPDATED';
	payload: Record<string, unknown>;
	createdAt: string;
	readAt: string | null;
};

export const fetchMyNotifications = async (): Promise<RawNotification[]> => {
	const response = await api.get('/user/notifications');
	return (response.data ?? []) as RawNotification[];
};

export const readAllMyNotifications = async (): Promise<{ updatedCount: number }> => {
	const response = await api.put('/user/notifications/read-all');
	return response.data as { updatedCount: number };
};
