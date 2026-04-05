import { useEffect, useState } from 'react';
import ContainerComp from "../../layout/layout_client/Container";
import Ticket from "../../components/client_components/Ticket";
import SearchInput from "../../components/client_components/SearchInput";
import TicketFilter, { type TicketFilterOption } from "../../components/client_components/TicketFilter";
import CreateTicketView from '../../components/client_components/CreateTicketView';
import { fetchMyTicketsForClientView } from '../../services/tickets';
import { type TicketType, TicketPriority, TicketStatus } from '../../types';
import { getSocket } from '../../services/singleton';

function ClientMyTickets() {
	const status = [
		{ label: "Tous", value: null },
		{ label: "Ouverts", value: TicketStatus.OPEN },
		{ label: "En cours", value: TicketStatus.IN_PROGRESS },
		{ label: "Résolus", value: TicketStatus.RESOLVED },
		{ label: "Fermés", value: TicketStatus.CLOSED },
	];

	const priorities = [
		{ label: "Tous", value: null },
		{ label: "Basses", value: TicketPriority.LOW },
		{ label: "Moyennes", value: TicketPriority.MEDIUM },
		{ label: "Hautes", value: TicketPriority.HIGH },
		{ label: "Urgentes", value: TicketPriority.URGENT },
	];

	const [currentFilterStatus, setCurrentFilterStatus] = useState(status[0].label);
	const [currentFilterPriority, setCurrentFilterPriority] = useState(priorities[0].label);

	const [tickets, setTickets] = useState<TicketType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);


	const handleSelectStatus = (e: React.MouseEvent, element: TicketFilterOption) => {
		e.stopPropagation();
		setCurrentFilterStatus(element.label);
	}

	const handleSelectPriority = (e: React.MouseEvent, element: TicketFilterOption) => {
		e.stopPropagation();
		setCurrentFilterPriority(element.label);
	}

	const loadTickets = async () => {
		try {
			const data = await fetchMyTicketsForClientView();
			setTickets(data);
		} catch (error) {
			console.error('Erreur chargement tickets client:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadTickets();

		const socket = getSocket();

		const handleticketStatusUpdated = (updatedTicket: { id: number; status: TicketStatus }) => {
			setTickets((prev) =>
				prev.map((t) => t.id === updatedTicket.id ? { ...t, status: updatedTicket.status } : t)
			);
		};
		const handleticketUnreadUpdated = (payload: { ticketId: number; clientUnreadCount: number }) => {
			setTickets((prev) =>
				prev.map((t) =>
					t.id === payload.ticketId
						? {
							...t,
							clientUnreadCount: payload.clientUnreadCount,
							hasMessage: payload.clientUnreadCount > 0,
						}
						: t
				)
			);
		};
		socket.on('ticketStatusUpdated', handleticketStatusUpdated);
		socket.on('ticketUnreadUpdated', handleticketUnreadUpdated);
		return () => {
			socket.off('ticketStatusUpdated', handleticketStatusUpdated);
			socket.off('ticketUnreadUpdated', handleticketUnreadUpdated);
		};
	}, []);

	return (
		<>
			<CreateTicketView
				isOpen={isCreateTicketOpen}
				onClose={() => setIsCreateTicketOpen(false)}
				onTicketCreated={loadTickets}
			/>
			<div className="pt-6 pb-10 min-h-full">
				<ContainerComp>
					<div className="mb-7 flex items-center justify-between gap-3">
						<h1 className="font-poppins text-navy font-semibold">
							Mes Tickets
						</h1>
						<button
							type="button"
							onClick={() => setIsCreateTicketOpen(true)}
							className="btn btn-info"
						>
							Créer un ticket
						</button>
					</div >
					<div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
						<SearchInput />
						<TicketFilter list={status} currentFilterElement={currentFilterStatus} handleSelect={handleSelectStatus} />
						<TicketFilter list={priorities} currentFilterElement={currentFilterPriority} handleSelect={handleSelectPriority} />
					</div>
					<p className="my-4">Tous les tickets</p>
					{
						isLoading ? (
							<p className="text-sm text-gray-500">Chargement des tickets...</p>
						) : (
							<div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
								{
									tickets.map((t, i) => (
										<Ticket ticket={t} key={i} />
									))
								}
							</div>
						)
					}
				</ContainerComp >
			</div >
		</>
	);
}

export default ClientMyTickets;
