import {useEffect, useState, useMemo} from 'react';
import {Search, Filter} from 'lucide-react';
import {TicketStatus, TicketPriority, UserRole} from '../../types';
import type {Ticket} from '../../types';
import {TicketList} from './TicketList';
import {fetchTickets, normalizeTicket, sortTicketsForAgent, fetchMyNotifications, readAllMyNotifications, type RawTicket, type RawNotification} from '../../services/tickets';
import {getSocket} from '../../services/singleton';
import {
	emitNotificationsMarkedAsRead,
	markNotificationsAsReadLocally,
	subscribeNotificationsMarkedAsRead,
} from '../../services/notification-sync';
import {useTranslation} from 'react-i18next';
import Notification from '../../components/client_components/Notification';
import {type ClientNotificationItem} from '../../components/client_components/NotificationView';

type SystemNotificationCode =
	| 'NEW_CLIENT_TICKET'
	| 'USER_PROFILE_UPDATED'
	| 'USER_LOGGED_IN'
	| 'TICKET_STATUS_UPDATED';

type SystemNotificationEvent = {
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

function mapSystemNotificationText(
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

export function TicketsPage() {
	const {t} = useTranslation('agent');
	const {t: tn} = useTranslation('notifications');
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>(TicketStatus.OPEN);
	const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');

	const [notifications, setNotifications] = useState<ClientNotificationItem[]>([]);
	const hasNotification = useMemo(
		() => notifications.some((n) => !n.readAt),
		[notifications],
	);

	useEffect(() => {
		let mounted = true;
		const socket = getSocket();

		const mapFromApi = (row: RawNotification): SystemNotificationEvent => ({
			id: row.id,
			code: row.code,
			createdAt: row.createdAt,
			readAt: row.readAt,
			data: row.payload as SystemNotificationEvent['data'],
		});

		const loadNotifications = async () => {
			try {
				const rows = await fetchMyNotifications();
				if (!mounted) return;

				setNotifications(
					rows.map((row) => {
						const event = mapFromApi(row);
						return {
							id: event.id,
							text: mapSystemNotificationText(event, tn),
							createdAt: event.createdAt,
							readAt: event.readAt ?? null,
						};
					}),
				);
			} catch (error) {
				console.error('Erreur chargement notifications tickets:', error);
			}
		};

		void loadNotifications();

		const onSystemNotification = (event: SystemNotificationEvent) => {
			const text = mapSystemNotificationText(event, tn);
			setNotifications((old) =>
				[
					{
						id: event.id,
						text,
						createdAt: event.createdAt,
						readAt: event.readAt ?? null,
					},
					...old,
				].slice(0, 50),
			);
		};

		socket.on('systemNotification', onSystemNotification);
		return () => {
			mounted = false;
			socket.off('systemNotification', onSystemNotification);
		};
	}, [tn]);

	useEffect(() => {
		return subscribeNotificationsMarkedAsRead(() => {
			setNotifications((prev) => markNotificationsAsReadLocally(prev));
		});
	}, []);

	const handleOpenNotifications = () => {
		setNotifications((prev) => markNotificationsAsReadLocally(prev));
		emitNotificationsMarkedAsRead();
		void readAllMyNotifications();
	};

	useEffect(() => {
		const loadTickets = async () => {
			try {
				const data = await fetchTickets();
				setTickets(sortTicketsForAgent(data.filter((ticket) => ticket.author.role === UserRole.CLIENT)));
			} catch (error) {
				console.error('Erreur chargement tickets:', error);
			} finally {
				setIsLoading(false);
			}
		};

		const socket = getSocket();
		const onUnread = (payload: {ticketId: number; agentUnreadCount: number; clientUnreadCount: number}) => {
			setTickets((prev) =>
				prev.map((t) =>
					t.id === payload.ticketId
						? {
							...t,
							agentUnreadCount: payload.agentUnreadCount,
							clientUnreadCount: payload.clientUnreadCount,
						}
						: t
				)
			);
		};

		const onTicketStatusUpdated = (payload: RawTicket) => {
			const updatedTicket = normalizeTicket(payload);
			if (updatedTicket.author.role !== UserRole.CLIENT) return;

			setTickets((prev) => {
				const exists = prev.some((ticket) => ticket.id === updatedTicket.id);
				const next = exists
					? prev.map((ticket) => ticket.id === updatedTicket.id ? {...ticket, ...updatedTicket} : ticket)
					: [updatedTicket, ...prev];
				return sortTicketsForAgent(next);
			});
		};

		loadTickets();
		socket.on('ticketStatusUpdated', onTicketStatusUpdated);
		socket.on('ticketUnreadUpdated', onUnread);
		return () => {
			socket.off('ticketStatusUpdated', onTicketStatusUpdated);
			socket.off('ticketUnreadUpdated', onUnread);
		};
	}, []);

	const filteredTickets = tickets.filter(ticket => {
		const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
		const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
		return matchesSearch && matchesStatus && matchesPriority;
	})
		.sort((a, b) => {
			const aClosed = a.status === TicketStatus.CLOSED;
			const bClosed = b.status === TicketStatus.CLOSED;

			if (aClosed !== bClosed)
				return aClosed ? 1 : -1;

			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

	return (
		<div className="flex-1 overflow-auto bg-cream">
			{/* Header */}
			<div className="border-b px-8 py-6 bg-white border-gray-200">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">{t('allTicketsTitle')}</h1>
						<p className="text-gray-600 mt-1">
							{t('allTicketsSubtitle')}
						</p>
					</div>
					<div className="hidden lg:block flex items-center gap-3">
						<Notification
							hasNotification={hasNotification}
							notifications={notifications}
							onOpen={handleOpenNotifications}
						/>
					</div>
				</div>

				{/* Filters */}
				<div className="flex flex-col sm:flex-row gap-4">
					{/* Search */}
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder={t('searchPlaceholder')}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
						/>
					</div>

					{/* Status Filter */}
					<div className="flex items-center gap-2">
						<Filter className="w-5 h-5 text-gray-600" />
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'ALL')}
							className="px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
						>
							<option value="ALL">{t('allStatuses')}</option>
							<option value={TicketStatus.OPEN}>{t('statusOpen')}</option>
							<option value={TicketStatus.IN_PROGRESS}>{t('statusInProgress')}</option>
							<option value={TicketStatus.RESOLVED}>{t('statusResolved')}</option>
							<option value={TicketStatus.CLOSED}>{t('statusClosed')}</option>
						</select>
					</div>

					{/* Priority Filter */}
					<select
						value={priorityFilter}
						onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'ALL')}
						className="px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
					>
						<option value="ALL">{t('allPriorities')}</option>
						<option value={TicketPriority.URGENT}>{t('priorityUrgent')}</option>
						<option value={TicketPriority.HIGH}>{t('priorityHigh')}</option>
						<option value={TicketPriority.MEDIUM}>{t('priorityMedium')}</option>
						<option value={TicketPriority.LOW}>{t('priorityLow')}</option>
					</select>
				</div>
			</div>

			{/* Content */}
			<div className="p-8">
				{isLoading ? (
					<div className="rounded-xl border p-12 text-center bg-white border-gray-200">
						<p className="text-gray-600">{t('loadingTickets')}</p>
					</div>
				) : (
					<>
						{/* Results Count */}
						<div className="mb-4 text-gray-600">
							{t('ticketsFound', {count: filteredTickets.length})}
						</div>

						{/* Tickets List */}
						{filteredTickets.length > 0 ? (
							<TicketList tickets={filteredTickets} />
						) : (
							<div className="rounded-xl border p-12 text-center bg-white border-gray-200">
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gray-100">
									<Search className="w-8 h-8 text-gray-400" />
								</div>
								<h3 className="text-lg font-semibold mb-2 text-gray-900">
									{t('noTicketFoundTitle')}
								</h3>
								<p className="text-gray-600">
									{t('noTicketFoundDescription')}
								</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
