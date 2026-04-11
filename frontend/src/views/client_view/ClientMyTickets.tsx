import {useEffect, useState} from 'react';
import ContainerComp from "../../layout/layout_client/Container";
import Ticket from "../../components/client_components/Ticket";
import SearchInput from "../../components/client_components/SearchInput";
import TicketFilter, {type TicketFilterOption} from "../../components/client_components/TicketFilter";
import CreateTicketView from '../../components/client_components/CreateTicketView';
import {fetchMyTicketsForClientView} from '../../services/tickets';
import {type TicketType, TicketPriority, TicketStatus} from '../../types';
import {getSocket} from '../../services/singleton';
import {useTranslation} from 'react-i18next';

const noneTickets = '/assets/none_tickets.png';

function ClientMyTickets() {
	const {t} = useTranslation('tickets');

	const status = [
		{label: t('all'), value: null},
		{label: t('statusOpenPlural'), value: TicketStatus.OPEN},
		{label: t('statusInProgress'), value: TicketStatus.IN_PROGRESS},
		{label: t('statusResolvedPlural'), value: TicketStatus.RESOLVED},
		{label: t('statusClosedPlural'), value: TicketStatus.CLOSED},
	];

	const priorities = [
		{label: t('all'), value: null},
		{label: t('priorityLowPlural'), value: TicketPriority.LOW},
		{label: t('priorityMediumPlural'), value: TicketPriority.MEDIUM},
		{label: t('priorityHighPlural'), value: TicketPriority.HIGH},
		{label: t('priorityUrgentPlural'), value: TicketPriority.URGENT},
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

		const handleticketStatusUpdated = (updatedTicket: {id: number; status: TicketStatus}) => {
			setTickets((prev) =>
				prev.map((t) => t.id === updatedTicket.id ? {...t, status: updatedTicket.status} : t)
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
							{t('myTicketsTitle')}
						</h1>
						<button
							type="button"
							onClick={() => setIsCreateTicketOpen(true)}
							className="btn bg-navy outline-none border-none text-white shadow-none"
						>
							{t('createTicket')}
						</button>
					</div >
					<div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
						<SearchInput />
						<TicketFilter label={t('filterStatus')} list={status} currentFilterElement={currentFilterStatus} handleSelect={handleSelectStatus} />
						<TicketFilter label={t('filterPriority')} list={priorities} currentFilterElement={currentFilterPriority} handleSelect={handleSelectPriority} />
					</div>
					{
						isLoading ? (
							<p className="text-sm text-gray-500">{t('loadingTickets')}</p>
						) : (
							<div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
								{tickets.length === 0 ? (
									<div className="col-span-full flex flex-col items-center mt-14 justify-center py-10 text-gray-400">
										<img
											src={noneTickets}
											alt={t('noTickets')}
											className="w-42 h-42 mb-4"
										/>
										<p>{t('noTickets')}</p>
									</div>
								) : (
									tickets.map((t, i) => <Ticket ticket={t} key={i} />)
								)}
							</div>
						)
					}
				</ContainerComp >
			</div >
		</>
	);
}

export default ClientMyTickets;
