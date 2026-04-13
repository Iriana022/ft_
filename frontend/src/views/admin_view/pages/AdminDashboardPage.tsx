import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TicketIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';
import { type Ticket, type User, TicketStatus, StatCardType } from '../../../types';
import { fetchTickets, fetchUsers, type RawTicket } from '../../../services/tickets';
import { getSocket } from '../../../services/singleton';
import { upsertTicketFromSocket } from '../adminHelpers';
import { StatCard, TicketsActivities, RecentTickets } from '../components/AdminDashboardWidgets';

export function AdminDashboard() {
	const { t } = useTranslation('admin');
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [users, setUsers] = useState<User[]>([]);

	const loadTickets = async () => {
		try {
			const data = await fetchTickets();
			setTickets(data);
		} catch (error) {
			console.error('Erreur chargement tickets:', error);
		}
	};

	const loadUsers = async () => {
		try {
			const data = await fetchUsers();
			setUsers(data);
		} catch (error) {
			console.error('Erreur chargement tickets:', error);
		}
	};

	useEffect(() => {
		let mounted = true;

		void loadTickets();
		void loadUsers();
		const socket = getSocket();

		const refreshUsers = async () => {
			try {
				const data = await fetchUsers();
				if (!mounted) return;
				setUsers(data);
			} catch (error) {
				console.error('Erreur chargement users:', error);
			}
		};

		const onNewTicket = (payload: RawTicket) => {
			setTickets((prev) => upsertTicketFromSocket(prev, payload));
		};

		const onTicketStatusUpdated = (payload: RawTicket) => {
			setTickets((prev) => upsertTicketFromSocket(prev, payload));
		};

		const onAdminUsersChanged = () => {
			void refreshUsers();
		};

		const onAdminUserDeleted = () => {
			void refreshUsers();
		};

		const onSystemNotification = () => {
			void refreshUsers();
		};

		socket.on('newTicket', onNewTicket);
		socket.on('ticketStatusUpdated', onTicketStatusUpdated);
		socket.on('adminUsersChanged', onAdminUsersChanged);
		socket.on('adminUserDeleted', onAdminUserDeleted);
		socket.on('systemNotification', onSystemNotification);

		return () => {
			mounted = false;
			socket.off('newTicket', onNewTicket);
			socket.off('ticketStatusUpdated', onTicketStatusUpdated);
			socket.off('adminUsersChanged', onAdminUsersChanged);
			socket.off('adminUserDeleted', onAdminUserDeleted);
			socket.off('systemNotification', onSystemNotification);
		};
	}, []);

	const openTickets = tickets.filter((ticket) => ticket.status === TicketStatus.OPEN);
	const closedTickets = tickets.filter((ticket) => ticket.status === TicketStatus.CLOSED);

	return (
		<div className="p-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				<StatCard
					title={t('totalTickets')}
					count={tickets.length}
					icon={TicketIcon}
					type={StatCardType.TOTAL_TICKET}
				/>
				<StatCard
					title={t('openTickets')}
					count={openTickets.length}
					icon={ClockIcon}
					type={StatCardType.OPEN_TICKET}
				/>
				<StatCard
					title={t('closedTickets')}
					count={closedTickets.length}
					icon={TicketIcon}
					type={StatCardType.CLOSED_TICKET}
				/>
				<StatCard
					title={t('users')}
					count={users.length}
					icon={UsersIcon}
					type={StatCardType.USERS}
				/>
			</div>
			<div className="flex flex-col md:flex-row items-center mt-6 gap-4">
				<TicketsActivities />
			</div>
			<RecentTickets />
		</div>
	);
}
