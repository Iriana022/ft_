import type {Ticket} from '../../types';
import {TicketStatus, TicketPriority} from '../../types';
import {Clock, User, AlertCircle} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

interface TicketListProps {
	tickets: Ticket[];
	maxItems?: number;
}

const DEFAULT_AGENT_AVATAR = '/assets/avatars/avatar2.png';

const getAssignedAgentAvatar = (ticket: Ticket) => {
	const avatar = ticket.assignedTo?.avatar;
	return avatar && avatar.length > 0 ? avatar : DEFAULT_AGENT_AVATAR;
};

export function TicketList({tickets, maxItems}: TicketListProps) {
	const {t} = useTranslation('agent');
	const {t: tt} = useTranslation('tickets');
	const navigate = useNavigate();
	const displayTickets = maxItems ? tickets.slice(0, maxItems) : tickets;

	const statusConfig = {
		[TicketStatus.OPEN]: {label: tt('statusOpen'), color: 'bg-red-100 text-red-700'},
		[TicketStatus.IN_PROGRESS]: {label: tt('statusInProgress'), color: 'bg-orange-100 text-orange-700'},
		[TicketStatus.RESOLVED]: {label: tt('statusResolved'), color: 'bg-green-100 text-green-700'},
		[TicketStatus.CLOSED]: {label: tt('statusClosed'), color: 'bg-gray-100 text-gray-700'},
	};

	const priorityConfig = {
		[TicketPriority.LOW]: {label: tt('priorityLow'), color: 'text-green-600'},
		[TicketPriority.MEDIUM]: {label: tt('priorityMedium'), color: 'text-blue-600'},
		[TicketPriority.HIGH]: {label: tt('priorityHigh'), color: 'text-orange-600'},
		[TicketPriority.URGENT]: {label: tt('priorityUrgent'), color: 'text-red-600'},
	};

	const formatDate = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - new Date(date).getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);

		if (days > 0) return tt('daysAgo', {count: days});
		if (hours > 0) return tt('hoursAgo', {count: hours});
		return tt('justNow');
	};

	return (
		<div className="rounded-xl border overflow-hidden bg-white border-gray-200">
			<div className="p-4 sm:p-6 border-b border-gray-200">
				<h3 className="text-lg font-bold text-gray-900">{t('recentTickets')}</h3>
			</div>

			<div className="divide-y divide-gray-100">
				{displayTickets.map((ticket) => (
					<div
						key={ticket.id}
						className="p-4 sm:p-6 transition-colors cursor-pointer hover:bg-gray-50"
						onClick={() =>
							navigate(`/chat_ticket?ticketId=${ticket.id}`, {
								state: {
									ticket,
								},
							})
						}
					>
						<div className="flex flex-col sm:flex-row items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								<div className="flex flex-wrap items-center gap-2 mb-2">
									<span className="text-sm font-medium text-gray-500">#{ticket.id}</span>
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[ticket.status].color}`}>
										{statusConfig[ticket.status].label}
									</span>
									{ticket.agentUnreadCount > 0 && (
										<span
											className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"
											title={tt('unreadMessagesTitle', {count: ticket.agentUnreadCount})}
										/>
									)}
								</div>

								<h4 className="font-semibold mb-1 truncate text-gray-900">
									{ticket.title}
								</h4>

								<p className="text-sm line-clamp-2 mb-3 text-gray-600">
									{ticket.description}
								</p>

								<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500">
									<div className="flex items-center gap-1">
										<User className="w-4 h-4" />
										<span>{t('createdBy')} {ticket.author.login || ticket.author.email}</span>
									</div>

									<div className="flex items-center gap-1">
										<Clock className="w-4 h-4" />
										<span>{formatDate(ticket.createdAt)}</span>
									</div>

									{ticket.assignedTo && (
										<div className="flex items-center gap-1">
											<img
												src={getAssignedAgentAvatar(ticket)}
												alt={ticket.assignedTo.login || ticket.assignedTo.email || tt('unknownAgent')}
												className="w-5 h-5 rounded-full"
												onError={(e) => {
													e.currentTarget.src = DEFAULT_AGENT_AVATAR;
												}}
											/>
											<span>{t('assignedTo')} {ticket.assignedTo.login || ticket.assignedTo.email || tt('unknownAgent')}</span>
										</div>
									)}
								</div>
							</div>

							<div className="flex flex-col items-start sm:items-end gap-2">
								<div className={`flex items-center gap-1 ${priorityConfig[ticket.priority].color}`}>
									<AlertCircle className="w-4 h-4" />
									<span className="text-sm font-medium">{priorityConfig[ticket.priority].label}</span>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{maxItems && tickets.length > maxItems && (
				<div className="p-4 text-center bg-gray-50">
					<button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
						{t('viewAllTickets', {count: tickets.length})}
					</button>
				</div>
			)}
		</div>
	);
}
