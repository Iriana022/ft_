import { format, subDays, isSameDay } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import { TicketPriority, TicketStatus, type Ticket } from '../../types';
import { normalizeTicket, type RawTicket, type TicketResolutionHistoryItem } from '../../services/tickets';

export type SystemNotificationCode =
	| 'NEW_CLIENT_TICKET'
	| 'USER_PROFILE_UPDATED'
	| 'USER_LOGGED_IN'
	| 'TICKET_STATUS_UPDATED';

export type SystemNotificationEvent = {
	id: number;
	code: SystemNotificationCode;
	createdAt: string;
	readAt?: string | null;
	data?: {
		ticketId?: number;
		ticketTitle?: string;
		userLogin?: string;
		userRole?: 'CLIENT' | 'AGENT' | 'ADMIN';
		fromStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
		toStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
		clientLogin?: string;
	};
};

export function mapSystemNotificationText(
	event: SystemNotificationEvent,
	tn: (key: string, options?: Record<string, unknown>) => string,
) {
	const userLogin = event.data?.userLogin ?? tn('unknownUser');
	const roleLabel =
		event.data?.userRole === 'AGENT'
			? tn('roleAgent')
			: event.data?.userRole === 'CLIENT'
				? tn('roleClient')
				: event.data?.userRole ?? '';

	if (event.code === 'NEW_CLIENT_TICKET') {
		return tn('newClientTicketForSupport', {
			ticketId: event.data?.ticketId ?? '-',
			ticketTitle: event.data?.ticketTitle ?? '',
			userLogin,
		});
	}

	if (event.code === 'USER_PROFILE_UPDATED') {
		return tn('userProfileUpdatedForAdmin', {
			userLogin,
			userRole: roleLabel,
		});
	}

	const statusLabel = (status?: string) => {
		if (status === 'OPEN') return tn('statusOpen');
		if (status === 'IN_PROGRESS') return tn('statusInProgress');
		if (status === 'RESOLVED') return tn('statusResolved');
		if (status === 'CLOSED') return tn('statusClosed');
		return status ?? '-';
	};

	if (event.code === 'TICKET_STATUS_UPDATED') {
		const fromStatus = statusLabel(event.data?.fromStatus);
		const toStatus = statusLabel(event.data?.toStatus);

		if (event.data?.clientLogin) {
			return tn('ticketStatusChangedForAdmin', {
				ticketId: event.data?.ticketId ?? '-',
				clientLogin: event.data.clientLogin,
				fromStatus,
				toStatus,
			});
		}

		return tn('ticketStatusChangedForClient', {
			ticketId: event.data?.ticketId ?? '-',
			fromStatus,
			toStatus,
		});
	}

	return tn('userLoggedInForAdmin', {
		userLogin,
		userRole: roleLabel,
	});
}

export const generateDailyTickets = (
	tickets: Ticket[],
	resolutionHistory: TicketResolutionHistoryItem[],
	language: string,
) => {
	const locale = language.startsWith('es') ? es : language.startsWith('en') ? enUS : fr;
	const last7Days = [...Array(7)].map((_, i) => subDays(new Date(), i)).reverse();

	return last7Days.map((date) => {
		const name = format(date, 'eee', { locale });

		const created = tickets.filter((t) =>
			isSameDay(new Date(t.createdAt), date)
		).length;

		const resolved = resolutionHistory.filter((h) =>
			h.toStatus === TicketStatus.RESOLVED &&
			isSameDay(new Date(h.changedAt), date)
		).length;

		return {
			name: name.charAt(0).toUpperCase() + name.slice(1).replace('.', ''),
			created,
			resolved
		};
	});
};

export function getStatusColor(status: TicketStatus) {
	let color: [string, string] = ['', ''];
	switch (status) {
		case TicketStatus.OPEN: {
			color[0] = 'bg-status-open/25';
			color[1] = 'text-status-open';
		} break;
		case TicketStatus.IN_PROGRESS: {
			color[0] = 'bg-status-in-progress/25';
			color[1] = 'text-status-in-progress';
		} break;
		case TicketStatus.RESOLVED: {
			color[0] = 'bg-status-resolved/25';
			color[1] = 'text-status-resolved';
		} break;
		case TicketStatus.CLOSED: {
			color[0] = 'bg-status-closed/25';
			color[1] = 'text-status-closed';
		} break;
		default: {
			throw new Error('Unkown ticket status');
		}
	}
	return color;
}

export function getStatusText(status: TicketStatus, t: (key: string) => string) {
	let statusText: string | undefined;
	switch (status) {
		case TicketStatus.OPEN: {
			statusText = t('statusOpen');
		} break;
		case TicketStatus.IN_PROGRESS: {
			statusText = t('statusInProgress');
		} break;
		case TicketStatus.RESOLVED: {
			statusText = t('statusResolved');
		} break;
		case TicketStatus.CLOSED: {
			statusText = t('statusClosed');
		} break;
		default: {
			throw new Error('Unkown ticket status');
		}
	}
	return statusText;
}

export function getPriorityText(priority: TicketPriority, t: (key: string) => string) {
	let priorityText: string | undefined;
	switch (priority) {
		case TicketPriority.LOW: {
			priorityText = t('priorityLow');
		} break;
		case TicketPriority.MEDIUM: {
			priorityText = t('priorityMedium');
		} break;
		case TicketPriority.HIGH: {
			priorityText = t('priorityHigh');
		} break;
		case TicketPriority.URGENT: {
			priorityText = t('priorityUrgent');
		} break;
		default: {
			throw new Error('Unkown ticket priority');
		}
	}
	return priorityText;
}

export function getPriorityColor(priority: TicketPriority): [string, string] {
	let color: [string, string] = ['', ''];

	switch (priority) {
		case TicketPriority.LOW: {
			color[0] = 'bg-green-100';
			color[1] = 'text-green-700';
		} break;
		case TicketPriority.MEDIUM: {
			color[0] = 'bg-yellow-100';
			color[1] = 'text-yellow-700';
		} break;
		case TicketPriority.HIGH: {
			color[0] = 'bg-orange-100';
			color[1] = 'text-orange-700';
		} break;
		case TicketPriority.URGENT: {
			color[0] = 'bg-red-100';
			color[1] = 'text-red-700';
		} break;
		default: {
			throw new Error('Unknown ticket priority');
		}
	}
	return color;
}

export function upsertTicketFromSocket(prev: Ticket[], payload: RawTicket): Ticket[] {
	const nextTicket = normalizeTicket(payload);
	const exists = prev.some((t) => t.id === nextTicket.id);
	if (!exists) {
		return [nextTicket, ...prev];
	}

	return prev.map((t) => (t.id === nextTicket.id ? { ...t, ...nextTicket } : t));
}
