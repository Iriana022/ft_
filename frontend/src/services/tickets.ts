import api from './api';
import {type ChatMessage, TicketStatus, type Ticket, type User} from '../types';
import {TicketPriority, type TicketType} from '../types';

export type RawUser = Omit<User, 'createdAt'> & {
	createdAt: string | Date;
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

const normalizeUser = (user: RawUser): User => ({
	...user,
	createdAt: new Date(user.createdAt),
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

		return b.createdAt.getTime() - a.createdAt.getTime();
	});
};

export const fetchTickets = async (): Promise<Ticket[]> => {
	const response = await api.get('/tickets');
	const rawTickets = (response.data ?? []) as RawTicket[];

	return rawTickets.map(normalizeTicket);
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
