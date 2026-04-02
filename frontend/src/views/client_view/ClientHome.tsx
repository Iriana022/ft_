import {useCallback, useEffect, useState} from 'react';
import Separator from '../../components/login_components/Separator';
import ContainerComp from '../../layout/layout_client/Container';
import ClientHomeHeroSection from '../../components/client_components/ClientHomeHeroSection';
import ClientHomeMyTicketsSection from '../../components/client_components/ClientHomeMyTicketsSection';
import {fetchMyTicketsForClientView} from '../../services/tickets';
import type {TicketType} from '../../types';
import { io } from 'socket.io-client';

function ClientHome() {
	const [tickets, setTickets] = useState<TicketType[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const loadTickets = useCallback(async () => {
		try {
			const data = await fetchMyTicketsForClientView();
			setTickets(data);
		} catch (error) {
			console.error('Erreur chargement tickets client:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadTickets();
		const socket = io('/', {
		path: '/socket.io',
		transports: ['websocket'],
		withCredentials: true,
		});

		socket.on('ticketStatusUpdated', (updatedTicket: TicketType) => {
			setTickets((prev) =>
				prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
			);
		});

		return () => {
			socket.disconnect();
		};
	}, [loadTickets]);

	return (
		<div>
			<ContainerComp>
				<ClientHomeHeroSection onTicketCreated={loadTickets} />
			</ContainerComp>
			<Separator />
			<ContainerComp>
				<ClientHomeMyTicketsSection tickets={tickets} isLoading={isLoading} />
			</ContainerComp>
		</div >
	);
}

export default ClientHome;
