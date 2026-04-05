import { useCallback, useEffect, useState } from 'react';
import Separator from '../../components/login_components/Separator';
import ContainerComp from '../../layout/layout_client/Container';
import ClientHomeHeroSection from '../../components/client_components/ClientHomeHeroSection';
import ClientHomeMyTicketsSection from '../../components/client_components/ClientHomeMyTicketsSection';
import { fetchMyTicketsForClientView } from '../../services/tickets';
import type { TicketType } from '../../types';
import { getSocket } from '../../services/singleton';

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
		const socket = getSocket();

		const handleticketStatusUpdated = (updatedTicket: TicketType) => {
			setTickets((prev) =>
				prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
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
						: t,
				),
			);
		};
		socket.on('ticketStatusUpdated', handleticketStatusUpdated);
		socket.on('ticketUnreadUpdated', handleticketUnreadUpdated);
		return () => {
			socket.off('ticketStatusUpdated', handleticketStatusUpdated);
			socket.off('ticketUnreadUpdated', handleticketUnreadUpdated);
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
