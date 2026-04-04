import { useEffect, useMemo, useRef, useState } from 'react';
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
import { fetchMyTicketsForClientView } from '../services/tickets';
import { io } from 'socket.io-client'
import { type ClientNotificationItem } from '../components/client_components/NotificationView';

const avatar1 = '/assets/avatars/avatar1.jpg';

function Header() {
	const [isMenuOpened, setIsMenuOpened] = useState(false);
	const [unreadByTicket, setUnreadByTicket] = useState<Record<number, number>>({});
	const [notifications, setNotifications] = useState<ClientNotificationItem[]>([]);
	const clientTicketIdsRef = useRef<Set<number>>(new Set());
	const navigate = useNavigate();
	const hasNotification = useMemo(
		() => Object.values(unreadByTicket).some((count) => count > 0),
		[unreadByTicket],
	);

	const handleLogout = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('username');
		localStorage.removeItem('user_role');
		navigate('/login');
	};
	useEffect(() => {
		let mounted = true;

		const loadClientTickets = async () => {
			try {
				const data = await fetchMyTicketsForClientView();
				if (!mounted) return;

				const ids = new Set<number>();
				const unreadMap: Record<number, number> = {};

				for (const ticket of data) {
					ids.add(ticket.id);
					unreadMap[ticket.id] = ticket.clientUnreadCount ?? 0;
				}

				clientTicketIdsRef.current = ids;
				setUnreadByTicket(unreadMap);
			} catch (error) {
				console.error('Erreur chargement notifications client:', error);
			}
		};

		loadClientTickets();

		const socket = io('/', {
			path: '/socket.io',
			transports: ['websocket'],
			withCredentials: true,
		});

		socket.on('ticketUnreadUpdated', (payload: { ticketId: number; clientUnreadCount: number }) => {
			if (!clientTicketIdsRef.current.has(payload.ticketId)) return;

			setUnreadByTicket((prev) => {
				const previousCount = prev[payload.ticketId] ?? 0;
				const nextCount = payload.clientUnreadCount ?? 0;

				if (nextCount > previousCount) {
					setNotifications((old) =>
						[
							{
								id: Date.now(),
								text: 'Nouveau message sur le ticket #' + payload.ticketId,
								createdAt: new Date().toISOString(),
							},
							...old,
						].slice(0, 20),
					);
				}

				return {
					...prev,
					[payload.ticketId]: nextCount,
				};
			});


		});

		return () => {
			mounted = false;
			socket.disconnect();
		};
	}, []);

	return (
		<div>
			<ContainerComp>
				<header className="pt-10 flex justify-between">
					{/* TODO: add transition later */}
					<div
						className={`fixed top-0 md:hidden w-screen h-full bg-dark z-69 ${isMenuOpened ? "left-0" : "-left-full"
							}`}
					>
						<MobileMenu />
					</div>
					<div className="flex gap-[100px]">
						<HamburgerMenu onClick={() => setIsMenuOpened(s => !s)} isMenuOpened={isMenuOpened} />
						<div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
							<TikeoLogo href="/client" color="text-navy" size="text-4xl" />
						</div>
						<nav className="hidden md:flex gap-5">
							<NavItem icon={HomeIcon} href="/client" text="Acceuil" color="text-gray-500" />
							<NavItem icon={TicketIcon} href="/client/my_tickets" text="Mes Tickets" color="text-gray-600" />
							<NavItem icon={Cog8ToothIcon} href="/client/settings" text="Parametres" color="text-gray-600" />
						</nav>
					</div>
					<div className="flex items-center gap-8">
						<Notification
							hasNotification={hasNotification}
							notifications={notifications}
						/>
						<button
							onClick={handleLogout}
							className="hidden md:block text-sm font-medium text-gray-600 hover:text-navy"
						>
							Déconnexion
						</button>
						<Link to='profil' className="hidden md:block">
							<Avatar src={avatar1} size="md" />
						</Link>
					</div>
				</header>
			</ContainerComp >
		</div>
	);
}

export default Header;
