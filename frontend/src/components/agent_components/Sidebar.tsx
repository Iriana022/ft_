import { LayoutDashboard, Ticket, Users, Settings, LogOut, Bell } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import TikeoLogo from '../client_components/TikeoLogo';
import { getMyProfile } from '../../services/profile';
import { useTranslation } from 'react-i18next';
import Notification from '../client_components/Notification';
import { type ClientNotificationItem } from '../client_components/NotificationView';
import { getSocket } from '../../services/singleton';
import {
	fetchMyNotifications,
	readAllMyNotifications,
	type RawNotification
} from '../../services/tickets';


const DEFAULT_AGENT_AVATAR = '/assets/avatars/avatar2.png';

interface SidebarProps {
	currentRole: UserRole;
}

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



export function Sidebar({ currentRole }: SidebarProps) {
	const { t } = useTranslation('agent');
	const navigate = useNavigate();
	const location = useLocation()
	const username = localStorage.getItem('username') || t('defaultUser');

	const [avatar, setAvatar] = useState(
		localStorage.getItem('user_avatar') || DEFAULT_AGENT_AVATAR
	);

	const { t: tn } = useTranslation('notifications');
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

	useEffect(() => {
		let mounted = true;

		const loadAvatar = async () => {
			try {
				const cachedAvatar = localStorage.getItem('user_avatar');
				if (cachedAvatar) {
					setAvatar(cachedAvatar);
				}

				const me = await getMyProfile();
				if (!mounted) return;

				const nextAvatar = me?.avatar || DEFAULT_AGENT_AVATAR;
				setAvatar(nextAvatar);
				localStorage.setItem('user_avatar', nextAvatar);
			} catch (error) {
				console.error('Erreur chargement avatar sidebar:', error);
			}
		};

		const handleAvatarUpdated = (event: Event) => {
			const customEvent = event as CustomEvent<{ avatar?: string }>;
			const nextAvatar =
				customEvent.detail?.avatar ||
				localStorage.getItem('user_avatar') ||
				DEFAULT_AGENT_AVATAR;
			setAvatar(nextAvatar);
		};

		loadAvatar();
		window.addEventListener('agent-avatar-updated', handleAvatarUpdated);

		return () => {
			mounted = false;
			window.removeEventListener('agent-avatar-updated', handleAvatarUpdated);
		};
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('username');
		localStorage.removeItem('user_role');
		localStorage.removeItem('user_avatar');
		navigate('/login');
	};

	const handleOpenNotifications = () => {
		setNotifications((prev) =>
			prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })),
		);
		void readAllMyNotifications();
	};
	const menuItems = [
		{ id: 'dashboard', label: t('sidebarDashboard'), icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT] },
		{ id: 'tickets', label: t('sidebarTickets'), icon: Ticket, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT] },
		{ id: 'users', label: t('sidebarUsers'), icon: Users, roles: [UserRole.ADMIN] },
		{ id: 'notifications', label: t('sidebarNotifications'), icon: Bell, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT] },
		{ id: 'settings', label: t('sidebarSettings'), icon: Settings, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT] }
	];

	const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));

	return (
		<aside className="w-64 border-r h-screen flex flex-col bg-navy border-gray-200">
			<div
				className="p-4 flex items-center justify-between">
				<TikeoLogo href="/client" color="text-white" size="text-4xl" />
				<Notification hasNotification={hasNotification} notifications={notifications} onOpen={handleOpenNotifications} />
			</div>
			{/* Navigation */}
			<nav className="flex-1 p-4 space-y-1">
				{
					filteredItems.map((item) => {
						const Icon = item.icon;
						const targetPath = `/agent/${item.id}`;
						const isActive = location.pathname === targetPath;

						return (
							<button
								key={item.id}
								onClick={() => navigate(targetPath)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
								${isActive
										? 'bg-sky/30 text-white'
										: 'text-white hover:bg-dark/15'
									}
								`}
							>
								<Icon className="w-5 h-5" />
								<span className="font-medium">{item.label}</span>
							</button>
						);
					})
				}
			</nav >

			<div className="p-4 border-t border-gray-100/25">
				<div className="flex items-center gap-3 mb-3">
					<img
						src={avatar}
						alt="User"
						className="w-10 h-10 rounded-full"
						onError={(e) => {
							e.currentTarget.src = DEFAULT_AGENT_AVATAR;
						}}
					/>
					<div className="flex-1">
						<p className="font-medium text-sm text-white">{username}</p>
						<p className="text-xs capitalize text-white/60">{currentRole.toLowerCase()}</p>
					</div>
				</div>
				<button
					onClick={handleLogout}
					className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors text-white hover:bg-sky/50">
					<LogOut className="w-4 h-4" />
					<span>{t('logout')}</span>
				</button>
			</div >
		</aside >
	);
}
