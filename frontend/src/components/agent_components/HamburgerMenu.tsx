import {LayoutDashboard, Ticket, Users, Settings, LogOut, X} from 'lucide-react';
import {useState, useEffect, useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {UserRole} from '../../types';
import TikeoLogo from '../client_components/TikeoLogo';
import {getMyProfile} from '../../services/profile';
import {useTranslation} from 'react-i18next';
import Notification from '../client_components/Notification';
import {type ClientNotificationItem} from '../client_components/NotificationView';
import {getSocket} from '../../services/singleton';
import {
	fetchMyNotifications,
	readAllMyNotifications,
	type RawNotification
} from '../../services/tickets';
import {
	emitNotificationsMarkedAsRead,
	markNotificationsAsReadLocally,
	subscribeNotificationsMarkedAsRead,
} from '../../services/notification-sync';


const DEFAULT_AGENT_AVATAR = '/assets/avatars/avatar2.png';

interface HamburgerMenuProps {
	currentRole: UserRole;
	isOpen: boolean;
	onClose: () => void;
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


export function HamburgerMenu({currentRole, isOpen, onClose}: HamburgerMenuProps) {
	const {t} = useTranslation('agent');
	const {t: tc} = useTranslation('common');
	const navigate = useNavigate();
	const location = useLocation()
	const username = localStorage.getItem('username') || t('defaultUser');

	const [avatar, setAvatar] = useState(
		localStorage.getItem('user_avatar') || DEFAULT_AGENT_AVATAR
	);

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

	useEffect(() => {
		return subscribeNotificationsMarkedAsRead(() => {
			setNotifications((prev) => markNotificationsAsReadLocally(prev));
		});
	}, []);

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
			const customEvent = event as CustomEvent<{avatar?: string}>;
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
		window.dispatchEvent(new Event('auth-token-updated'));
		navigate('/login');
	};

	const handleOpenNotifications = () => {
		setNotifications((prev) => markNotificationsAsReadLocally(prev));
		emitNotificationsMarkedAsRead();
		void readAllMyNotifications();
	};

	const menuItems = [
		{id: 'dashboard', label: t('sidebarDashboard'), icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]},
		{id: 'tickets', label: t('sidebarTickets'), icon: Ticket, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]},
		{id: 'users', label: t('sidebarUsers'), icon: Users, roles: [UserRole.ADMIN]},
		{id: 'settings', label: t('sidebarSettings'), icon: Settings, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]}
	];

	const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));
	const dashboardPath = currentRole === UserRole.ADMIN ? '/admin' : '/agent/dashboard';

	const handleNavClick = (targetPath: string) => {
		navigate(targetPath);
		onClose();
	};

	return (
		<>
			<div
				className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
				onClick={onClose}
			/>
			<div
				className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-navy z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
			>
				<div className="flex flex-col h-full">
					<div className="p-4 flex items-center justify-between border-b border-white/10">
						<TikeoLogo href={dashboardPath} color="text-white" size="text-4xl" />
						<button
							onClick={onClose}
							className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					<nav className="flex-1 p-4 overflow-y-auto">
						<div className="hidden">
							<Notification hasNotification={hasNotification} notifications={notifications} onOpen={handleOpenNotifications} />
						</div>
						<div className="space-y-1">
							{filteredItems.map((item) => {
								const Icon = item.icon;
								const targetPath = `/agent/${item.id}`;
								const isActive = location.pathname === targetPath;

								return (
									<button
										key={item.id}
										onClick={() => handleNavClick(targetPath)}
										className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap
										${isActive
												? 'bg-sky/30 text-white shadow-sm'
												: 'text-white/70 hover:text-white hover:bg-white/10'
											}
										`}
									>
										<Icon className="w-5 h-5" />
										<span className="font-medium">{item.label}</span>
									</button>
								);
							})}
						</div>
					</nav>

					<div className="p-4 border-t border-white/10">
						<div className="flex items-center gap-3 mb-4">
							<img
								src={avatar}
								alt={tc('userAvatar')}
								className="w-10 h-10 rounded-full border-2 border-white/20"
								onError={(e) => {
									e.currentTarget.src = DEFAULT_AGENT_AVATAR;
								}}
							/>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-sm text-white truncate">{username}</p>
								<p className="text-xs capitalize text-white/50 truncate">{currentRole.toLowerCase()}</p>
							</div>
						</div>
						<button
							onClick={handleLogout}
							className="w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-all duration-200 text-white/70 hover:text-white hover:bg-red-500/20"
						>
							<LogOut className="w-4 h-4" />
							<span>{t('logout')}</span>
						</button>
					</div>
				</div>
			</div>
		</>
	);
}
