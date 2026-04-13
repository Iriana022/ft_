import {Outlet} from 'react-router-dom';
import {Sidebar} from '../../components/agent_components/Sidebar';
import {HamburgerMenu} from '../../components/agent_components/HamburgerMenu';
import {UserRole} from '../../types';
import {getStoredUserRole} from '../../services/auth';
import Footer from '../Footer';
import {Menu} from 'lucide-react';
import {useState, useEffect, useMemo} from 'react';
import Notification from '../../components/client_components/Notification';
import {type ClientNotificationItem} from '../../components/client_components/NotificationView';
import {getSocket} from '../../services/singleton';
import {
	fetchMyNotifications,
	readAllMyNotifications,
	type RawNotification
} from '../../services/tickets';
import {useTranslation} from 'react-i18next';
import TikeoLogo from '../../components/client_components/TikeoLogo';

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

export function DashboardLayout() {
	const currentRole = getStoredUserRole() ?? UserRole.AGENT;
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const {t: tn} = useTranslation('notifications');
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
				console.error('Erreur chargement notifications agent persistantes:', error);
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

	return (
		<div className="flex min-h-screen flex-col lg:flex-row bg-gray-50">
			<Sidebar currentRole={currentRole} />

			<HamburgerMenu
				currentRole={currentRole}
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
			/>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
					<button
						onClick={() => setIsMobileMenuOpen(true)}
						className="p-2 rounded-lg text-navy hover:bg-navy/10 transition-colors"
					>
						<Menu className="w-6 h-6" />
					</button>
					<TikeoLogo href="/agent" color="text-navy" size="text-3xl" />
					<Notification
						hasNotification={hasNotification}
						notifications={notifications}
						onOpen={handleOpenNotifications}
					/>
				</header>

				<main className="flex flex-1 min-h-0 flex-col">
					<Outlet />
				</main>
				<Footer />
			</div>
		</div>
	);
}
