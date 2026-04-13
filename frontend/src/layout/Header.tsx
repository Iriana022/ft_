import { useEffect, useMemo, useState } from 'react';
import TikeoLogo from '../components/client_components/TikeoLogo';
import NavItem from '../components/client_components/NavItem';
import { HomeIcon } from '@heroicons/react/24/outline';
import { TicketIcon } from '@heroicons/react/24/outline';
import { Cog8ToothIcon } from '@heroicons/react/24/outline';
import HamburgerMenu from '../components/client_components/HamburgerMenu';
import Notification from '../components/client_components/Notification';
import Avatar from '../components/client_components/Avatar';
import ContainerComp from './layout_client/Container';
import MobileMenu from '../components/client_components/MobileMenu';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMyNotifications, readAllMyNotifications, type RawNotification } from '../services/tickets';
import { type ClientNotificationItem } from '../components/client_components/NotificationView';
import { getMyProfile } from '../services/profile';
import { getSocket } from '../services/singleton';
import { useTranslation } from 'react-i18next';

const avatar1 = '/assets/avatars/avatar1.jpg';

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

	const statusLabel = (status?: string) => {
		if (status === 'OPEN') return tn('statusOpen');
		if (status === 'IN_PROGRESS') return tn('statusInProgress');
		if (status === 'RESOLVED') return tn('statusResolved');
		if (status === 'CLOSED') return tn('statusClosed');
		return status ?? '-';
	};

	if (event.code === 'TICKET_STATUS_UPDATED') {
		return tn('ticketStatusChangedForClient', {
			ticketId: event.data?.ticketId ?? '-',
			fromStatus: statusLabel(event.data?.fromStatus),
			toStatus: statusLabel(event.data?.toStatus),
		});
	}

	if (event.code === 'NEW_CLIENT_TICKET') {
		return tn('newClientTicketForSupport', {
			ticketId: event.data?.ticketId ?? '-',
			ticketTitle: event.data?.ticketTitle ?? '',
			userLogin,
		});
	}

	if (event.code === 'USER_PROFILE_UPDATED') {
		return tn('userProfileUpdatedForAdmin', { userLogin, userRole: roleLabel });
	}

	return tn('userLoggedInForAdmin', { userLogin, userRole: roleLabel });
}

function Header() {
	const [isMenuOpened, setIsMenuOpened] = useState(false);
	const [notifications, setNotifications] = useState<ClientNotificationItem[]>([]);
	const [avatar, setAvatar] = useState(avatar1);

	const navigate = useNavigate();

	const hasNotification = useMemo(
		() => notifications.some((n) => !n.readAt),
		[notifications],
	);

	const { t } = useTranslation('nav');
	const { t: tc } = useTranslation('common');
	const { t: tn } = useTranslation('notifications');

	const handleLogout = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('username');
		localStorage.removeItem('user_role');
		localStorage.removeItem('user_avatar');
		window.dispatchEvent(new Event('auth-token-updated'));
		navigate('/login');
	};

	useEffect(() => {
		const cachedAvatar = localStorage.getItem('user_avatar');
		if (cachedAvatar) {
			setAvatar(cachedAvatar);
		}

		const loadProfilAvatar = async () => {
			try {
				const data = await getMyProfile();
				const nextAvatar = data?.avatar ?? avatar1;
				setAvatar(nextAvatar);
				localStorage.setItem('user_avatar', nextAvatar);
			} catch (error) {
				console.error('Error on loading header avatar:', error);
			}
		};

		void loadProfilAvatar();
	}, []);

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
				console.error('Erreur chargement notifications client persistantes:', error);
			}
		};

		void loadNotifications();

		const onSystemNotification = (event: SystemNotificationEvent) => {
			setNotifications((old) =>
				[
					{
						id: event.id,
						text: mapSystemNotificationText(event, tn),
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
			prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })),
		);
		void readAllMyNotifications();
	};

	return (
		<div>
			<ContainerComp>
				<header className="pt-10 flex justify-between">
					<div
						className={`fixed top-0 md:hidden w-screen h-full bg-dark z-69 ${isMenuOpened ? 'left-0' : '-left-full'
							}`}
					>
						<MobileMenu />
					</div>
					<div className="flex gap-[100px]">
						<HamburgerMenu onClick={() => setIsMenuOpened((s) => !s)} isMenuOpened={isMenuOpened} />
						<div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
							<TikeoLogo href="/client" color="text-navy" size="text-4xl" />
						</div>
						<nav className="hidden md:flex gap-5">
							<NavItem icon={HomeIcon} href="/client" text={t('home')} color="text-gray-500" />
							<NavItem icon={TicketIcon} href="/client/my_tickets" text={t('myTickets')} color="text-gray-600" />
							<NavItem icon={Cog8ToothIcon} href="/client/settings" text={t('settings')} color="text-gray-600" />
						</nav>
					</div>
					<div className="flex items-center gap-8">
						<Notification
							hasNotification={hasNotification}
							notifications={notifications}
							onOpen={handleOpenNotifications}
						/>
						<button
							onClick={handleLogout}
							className="hidden md:block text-sm font-medium text-gray-600 hover:text-navy"
						>
							{tc('logout')}
						</button>
						<Link to="profil" className="hidden md:block">
							<Avatar src={avatar || avatar1} size="md" />
						</Link>
					</div>
				</header>
			</ContainerComp>
		</div>
	);
}

export default Header;