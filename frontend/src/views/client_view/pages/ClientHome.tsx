import {useCallback, useEffect, useState} from 'react';
import ContainerComp from '../../../layout/layout_client/Container';
import Separator from '../../../components/login_components/Separator';
import ClientHomeHeroSection from '../../../components/client_components/ClientHomeHeroSection';
import ClientHomeMyTicketsSection from '../../../components/client_components/ClientHomeMyTicketsSection';
import {fetchMyTicketsForClientView} from '../../../services/tickets';
import type {TicketType} from '../../../types';

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
	}, [loadTickets]);

	return (
		<>
			<ContainerComp>
				<ClientHomeHeroSection onTicketCreated={loadTickets} />
			</ContainerComp>
			<Separator />
			<ContainerComp>
				<ClientHomeMyTicketsSection tickets={tickets} isLoading={isLoading} />
			</ContainerComp>
			<Separator />
		</>
	);
}

export default ClientHome;
