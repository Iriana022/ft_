import { Ticket, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '../../components/agent_components/StatCard';
import { TicketList } from './TicketList';
import { TicketStatus, UserRole, type Ticket as TicketType } from '../../types';
import { fetchTickets, getTicketStats, normalizeTicket, sortTicketsForAgent, type RawTicket } from '../../services/tickets';
import { getSocket } from '../../services/singleton';

export function Dashboard() {
	const [tickets, setTickets] = useState<TicketType[]>([]);
	const [notification, setNotification] = useState<string | null>(null);

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
				setNotification("New ticket incoming : " + ticket.title);
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
		<div className="flex-1 overflow-auto bg-gray-50">
			{/* Notification popup */}
			{notification && (
				<div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border bg-white border-indigo-500 text-gray-900 transition-all">
					<AlertCircle className="w-5 h-5 text-indigo-500" />
					<span className="text-sm font-medium">{notification}</span>
					<button
						onClick={() => setNotification(null)}
						className="ml-2 text-xs text-gray-400 hover:text-gray-600"
					>
						✕
					</button>
				</div>
			)}

			{/* Header */}
			<div className="border-b px-8 py-6 bg-white border-gray-200">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
						<p className="text-gray-600 mt-1">Vue d'ensemble de vos tickets de support</p>
					</div>
					<div className="flex items-center gap-3">
						{/* ThemeToggle removed since dark mode not used */}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-8 space-y-6">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
					<StatCard
						title="Total des tickets"
						value={stats.total}
						icon={Ticket}
						color="blue"
					/>
					<StatCard
						title="Tickets ouverts"
						value={stats.open}
						icon={AlertCircle}
						color="red"
					/>
					<StatCard
						title="Tickets En cours"
						value={stats.inProgress}
						icon={Clock}
						color="orange"
					/>
					<StatCard
						title="Tickets Resolus"
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
