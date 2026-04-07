import {useEffect, useState} from 'react';
import {Search, Filter} from 'lucide-react';
import {TicketStatus, TicketPriority, UserRole} from '../../types';
import type {Ticket} from '../../types';
import {TicketList} from './TicketList';
import {fetchTickets} from '../../services/tickets';
import {getSocket} from '../../services/singleton';

export function TicketsPage() {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>(TicketStatus.OPEN);
	const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');

	useEffect(() => {
		const loadTickets = async () => {
			try {
				const data = await fetchTickets();
				setTickets(data.filter((ticket) => ticket.author.role === UserRole.CLIENT));
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

		loadTickets();
		socket.on('ticketUnreadUpdated', onUnread);
		return () => {
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

			return b.createdAt.getTime() - a.createdAt.getTime();
		});

	return (
		<div className="flex-1 overflow-auto bg-gray-50">
			{/* Header */}
			<div className="border-b px-8 py-6 bg-white border-gray-200">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Tous les tickets</h1>
						<p className="text-gray-600 mt-1">
							Gérez et suivez tous vos tickets de support
						</p>
					</div>
				</div>

				{/* Filters */}
				<div className="flex flex-col sm:flex-row gap-4">
					{/* Search */}
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Rechercher un ticket..."
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
							<option value="ALL">Tous les statuts</option>
							<option value={TicketStatus.OPEN}>Ouvert</option>
							<option value={TicketStatus.IN_PROGRESS}>En cours</option>
							<option value={TicketStatus.RESOLVED}>Résolu</option>
							<option value={TicketStatus.CLOSED}>Fermé</option>
						</select>
					</div>

					{/* Priority Filter */}
					<select
						value={priorityFilter}
						onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'ALL')}
						className="px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
					>
						<option value="ALL">Toutes les priorités</option>
						<option value={TicketPriority.URGENT}>Urgent</option>
						<option value={TicketPriority.HIGH}>Haute</option>
						<option value={TicketPriority.MEDIUM}>Moyenne</option>
						<option value={TicketPriority.LOW}>Basse</option>
					</select>
				</div>
			</div>

			{/* Content */}
			<div className="p-8">
				{isLoading ? (
					<div className="rounded-xl border p-12 text-center bg-white border-gray-200">
						<p className="text-gray-600">Chargement des tickets...</p>
					</div>
				) : (
					<>
						{/* Results Count */}
						<div className="mb-4 text-gray-600">
							{filteredTickets.length} ticket{filteredTickets.length > 1 ? 's' : ''} trouvé{filteredTickets.length > 1 ? 's' : ''}
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
									Aucun ticket trouvé
								</h3>
								<p className="text-gray-600">
									Essayez de modifier vos filtres ou votre recherche
								</p>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
