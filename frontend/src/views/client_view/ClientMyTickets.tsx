import {useEffect, useState} from 'react';
import ContainerComp from "../../layout/layout_client/Container";
import Ticket from "../../components/client_components/Ticket";
import SearchInput from "../../components/client_components/SearchInput";
import TicketFilter from "../../components/client_components/TicketFilter";
import CreateTicketView from '../../components/client_components/CreateTicketView';
import {fetchMyTicketsForClientView} from '../../services/tickets';
import type {TicketType} from '../../types';
import {io} from 'socket.io-client';

function ClientMyTickets() {
	const status = ["Tous", "Ouvert", "En cours", "En attente", "Resolu"];
	const priorities = ["Basse", "Moyenne", "Haute", "Urgente"];
	const [tickets, setTickets] = useState<TicketType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);

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

		const socket = io('/', {
		path: '/socket.io',
		transports: ['websocket'],
		withCredentials: true,
		});
		socket.on('ticketStatusUpdated', (updatedTicket: TicketType) => {
			setTickets((prev) =>
				prev.map((t) => t.id === updatedTicket.id ? updatedTicket : t)
			);
		});
		return () => {
			socket.disconnect();
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
						<TicketFilter list={status} />
						<TicketFilter list={priorities} />
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
