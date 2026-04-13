import {Ticket, AlertCircle, Clock, CheckCircle2} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import {StatCard} from '../../components/agent_components/StatCard';
import {TicketList} from './TicketList';
import {TicketStatus, UserRole, type Ticket as TicketType} from '../../types';
import {fetchMyNotifications, fetchTickets, getTicketStats, normalizeTicket, readAllMyNotifications, sortTicketsForAgent, type RawNotification, type RawTicket} from '../../services/tickets';
import {getSocket} from '../../services/singleton';
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

export function Dashboard() {
	const {t} = useTranslation('agent');
	const {t: tn} = useTranslation('notifications');
	const [tickets, setTickets] = useState<TicketType[]>([]);
	const [notification, setNotification] = useState<string | null>(null);
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
				console.error('Erreur chargement notifications dashboard:', error);
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

	const handleOpenNotifications = () => {
		setNotifications((prev) =>
			prev.map((n) => (n.readAt ? n : {...n, readAt: new Date().toISOString()})),
		);
		void readAllMyNotifications();
	};

	useEffect(() => {
		let notificationTimer: ReturnType<typeof setTimeout> | null = null;

		const loadTickets = async () => {
			try {
				const data = await fetchTickets();

				const clientTickets = data.filter(
					(ticket) => ticket.author.role === UserRole.CLIENT
				);
				setTickets(sortTicketsForAgent(clientTickets));
			} catch (error) {
				console.error('Erreur chargement tickets:', error);
			}
		};

		loadTickets();

		const socket = getSocket();

		const handleNewTicket = (payload: RawTicket) => {
			const ticket = normalizeTicket(payload);
			if (ticket.author.role === UserRole.CLIENT) {
				setTickets((prev) => sortTicketsForAgent([ticket, ...prev]));
				setNotification(t('newTicketIncoming', {title: ticket.title}));
				if (notificationTimer) clearTimeout(notificationTimer);
				notificationTimer = setTimeout(() => setNotification(null), 5000);
			}
		};

		const handleTicketStatusUpdated = (payload: RawTicket) => {
			const updatedTicket = normalizeTicket(payload);
			if (updatedTicket.author.role !== UserRole.CLIENT) return;

			setTickets((prev) => {
				const existingIndex = prev.findIndex((ticket) => ticket.id === updatedTicket.id);
				if (existingIndex === -1) {
					return sortTicketsForAgent([updatedTicket, ...prev]);
				}

				const next = [...prev];
				next[existingIndex] = {
					...next[existingIndex],
					...updatedTicket,
				};
				return sortTicketsForAgent(next);
			});
		};

		const handleticketUnreadUpdated = (payload: {
			ticketId: number;
			agentUnreadCount: number;
			clientUnreadCount: number;
		}) => {
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

		socket.on('newTicket', handleNewTicket);
		socket.on('ticketStatusUpdated', handleTicketStatusUpdated);
		socket.on('ticketUnreadUpdated', handleticketUnreadUpdated);
		return () => {
			socket.off('newTicket', handleNewTicket);
			socket.off('ticketStatusUpdated', handleTicketStatusUpdated);
			socket.off('ticketUnreadUpdated', handleticketUnreadUpdated);
			if (notificationTimer)
				clearTimeout(notificationTimer);
		};
	}, []);

	const stats = useMemo(() => getTicketStats(tickets), [tickets]);

	return (
		<div className="flex-1 overflow-auto bg-cream">
			{/* Notification popup */}
			{notification && (
				<div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 z-50 flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl shadow-lg border bg-white border-indigo-500 text-gray-900 transition-all">
					<AlertCircle className="w-5 h-5 text-indigo-500" />
					<span className="text-sm font-medium min-w-0 break-words">{notification}</span>
					<button
						onClick={() => setNotification(null)}
						className="ml-2 text-xs text-gray-400 hover:text-gray-600"
					>
						✕
					</button>
				</div>
			)}

			{/* Header */}
			<div className="border-b px-4 sm:px-6 lg:px-8 py-5 sm:py-6 bg-white border-gray-200">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('dashboardTitle')}</h1>
						<p className="text-gray-600 mt-1">{t('dashboardSubtitle')}</p>
					</div>
					<div className="hidden lg:block flex items-center gap-3">
						<Notification
							hasNotification={hasNotification}
							notifications={notifications}
							onOpen={handleOpenNotifications}
						/>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-4 sm:p-6 lg:p-8 space-y-6">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
					<StatCard
						title={t('totalTickets')}
						value={stats.total}
						icon={Ticket}
						color="blue"
					/>
					<StatCard
						title={t('openTickets')}
						value={stats.open}
						icon={AlertCircle}
						color="red"
					/>
					<StatCard
						title={t('inProgressTickets')}
						value={stats.inProgress}
						icon={Clock}
						color="orange"
					/>
					<StatCard
						title={t('resolvedTickets')}
						value={stats.resolved}
						icon={CheckCircle2}
						color="green"
					/>
				</div>

				{/* Recent Tickets */}
				<TicketList tickets={tickets} maxItems={4} />
			</div>
		</div>
	);
}
