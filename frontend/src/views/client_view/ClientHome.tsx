import {useCallback, useEffect, useMemo, useState} from 'react';
import Separator from '../../components/login_components/Separator';
import ContainerComp from '../../layout/layout_client/Container';
import ClientHomeHeroSection from '../../components/client_components/ClientHomeHeroSection';
import ClientHomeMyTicketsSection from '../../components/client_components/ClientHomeMyTicketsSection';
import {fetchMyTicketsForClientView} from '../../services/tickets';
import type {TicketType} from '../../types';
import {TicketStatus} from '../../types';
import {getSocket} from '../../services/singleton';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import {isWithinDateRange} from '../../services/dateRange';

function ClientHome() {
	const [tickets, setTickets] = useState<TicketType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');

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

		const handleticketStatusUpdated = (updatedTicket: {id: number; status: TicketStatus}) => {
			setTickets((prev) =>
				prev.map((t) =>
					t.id === updatedTicket.id
						? {...t, status: updatedTicket.status}
						: t
				),
			);
		};
		const handleticketUnreadUpdated = (payload: {ticketId: number; clientUnreadCount: number}) => {
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

		const handleTicketDeleted = (payload?: {ticketId?: number}) => {
			if (typeof payload?.ticketId !== 'number') return;
			setTickets((prev) => prev.filter((ticket) => ticket.id !== payload.ticketId));
		};
		socket.on('ticketStatusUpdated', handleticketStatusUpdated);
		socket.on('ticketUnreadUpdated', handleticketUnreadUpdated);
		socket.on('ticketDeleted', handleTicketDeleted);
		return () => {
			socket.off('ticketStatusUpdated', handleticketStatusUpdated);
			socket.off('ticketUnreadUpdated', handleticketUnreadUpdated);
			socket.off('ticketDeleted', handleTicketDeleted);
		};
	}, [loadTickets]);

	const filteredTickets = useMemo(
		() => tickets.filter((ticket) => isWithinDateRange(ticket.createdAt, fromDate, toDate)),
		[tickets, fromDate, toDate],
	);

	return (
		<div>
			<ContainerComp>
				<ClientHomeHeroSection onTicketCreated={loadTickets} />
			</ContainerComp>
			<Separator />
			<ContainerComp>
				<div className="py-4">
					<DateRangeFilter
						fromDate={fromDate}
						toDate={toDate}
						onFromDateChange={setFromDate}
						onToDateChange={setToDate}
						onClear={() => {
							setFromDate('');
							setToDate('');
						}}
					/>
				</div>
				<ClientHomeMyTicketsSection tickets={filteredTickets} isLoading={isLoading} />
			</ContainerComp>
		</div>
	);
}

export default ClientHome;
