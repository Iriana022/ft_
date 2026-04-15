import {type MouseEvent, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {MagnifyingGlassIcon} from '@heroicons/react/24/solid';
import {EyeIcon, TrashIcon} from '@heroicons/react/24/outline';
import TicketFilter from '../../../components/client_components/TicketFilter';
import {TicketPriority, TicketStatus, type Ticket} from '../../../types';
import {deleteTicketByAdmin, fetchTickets, getTicketAuthorLabel, type RawTicket, updateTicketStatus} from '../../../services/tickets';
import {getSocket} from '../../../services/singleton';
import {
	getPriorityColor,
	getPriorityText,
	getStatusColor,
	getStatusText,
	upsertTicketFromSocket,
} from '../adminHelpers';
import {useNavigate} from 'react-router-dom';

interface TicketsFooterProps {
	currentPage: number,
	totalPages: number,
	totalItems: number,
	onNext: () => void;
	onPrev: () => void;
}

function TicketsFooter(props: TicketsFooterProps) {
	const {t} = useTranslation('admin');
	const start = props.totalItems === 0 ? 0 : (props.currentPage - 1) * 8 + 1;
	const end = props.totalItems === 0 ? 0 : Math.min(props.currentPage * 8, props.totalItems);

	return (
		<div className="px-5 pt-3 flex items-center justify-between">
			<span className="text-xs md:text-sm text-gray-600">
				{t('displayingRange', {start, end, total: props.totalItems})}
			</span>
			<div className="flex items-center gap-3">
				<button
					onClick={props.onPrev}
					disabled={props.currentPage == 1}
					className="btn text-xs md:text-sm font-medium disabled:opacity-50 rounded-lg border border-1 bg-cream text-gray-600"
				>
					{t('previous')}
				</button>
				<button
					onClick={props.onNext}
					disabled={props.currentPage === props.totalPages}
					className="btn text-xs md:text-sm font-medium disabled:opacity-50 rounded-lg border border-1 bg-cream text-gray-600"
				>
					{t('next')}
				</button>
			</div>
		</div>
	);
}

const ITEMS_PER_PAGE = 8;

interface StatusFilter {
	label: string,
	value: TicketStatus | null,
}

interface PriorityFilter {
	label: string,
	value: TicketPriority | null,
}

export function AdminTickets() {
	const {t, i18n} = useTranslation('admin');
	const statusFilterElements = [
		{label: t('all'), value: null},
		{label: t('openPlural'), value: TicketStatus.OPEN},
		{label: t('inProgressPlural'), value: TicketStatus.IN_PROGRESS},
		{label: t('resolvedPlural'), value: TicketStatus.RESOLVED},
		{label: t('closedPlural'), value: TicketStatus.CLOSED},
	];

	const priorityFilterElements = [
		{label: t('all'), value: null},
		{label: t('lowPlural'), value: TicketPriority.LOW},
		{label: t('mediumPlural'), value: TicketPriority.MEDIUM},
		{label: t('highPlural'), value: TicketPriority.HIGH},
		{label: t('urgentPlural'), value: TicketPriority.URGENT},
	];

	const [currentFilterStatus, setCurrentFilterStatus] = useState<TicketStatus | null>(null);
	const [currentFilterPriority, setCurrentFilterPriority] = useState<TicketPriority | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusUpdatingTicketId, setStatusUpdatingTicketId] = useState<number | null>(null);
	const [deletingTicketId, setDeletingTicketId] = useState<number | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const loadTickets = async () => {
			try {
				setLoading(true);
				const data = await fetchTickets();
				setTickets(data);
				setError(null);
			} catch (e) {
				console.error('Erreur chargement tickets admin:', e);
				setError(t('loadTicketsError'));
			} finally {
				setLoading(false);
			}
		};

		void loadTickets();

		const socket = getSocket();

		const onNewTicket = (payload: RawTicket) => {
			setTickets((prev) => upsertTicketFromSocket(prev, payload));
		};

		const onTicketStatusUpdated = (payload: RawTicket) => {
			setTickets((prev) => upsertTicketFromSocket(prev, payload));
		};

		const onTicketDeleted = (payload?: {ticketId?: number}) => {
			if (typeof payload?.ticketId !== 'number') return;
			setTickets((prev) => prev.filter((ticket) => ticket.id !== payload.ticketId));
		};

		socket.on('newTicket', onNewTicket);
		socket.on('ticketStatusUpdated', onTicketStatusUpdated);
		socket.on('ticketDeleted', onTicketDeleted);

		return () => {
			socket.off('newTicket', onNewTicket);
			socket.off('ticketStatusUpdated', onTicketStatusUpdated);
			socket.off('ticketDeleted', onTicketDeleted);
		};
	}, [t]);

	const currentFilterElementStatus = statusFilterElements.find((element) => element.value === currentFilterStatus);
	const currentFilterElementPriority = priorityFilterElements.find((element) => element.value === currentFilterPriority);

	const filteredTickets = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();
		const hasSearch = normalizedSearch.length > 0;

		return tickets.filter((ticket) => {
			const ticketId = 'tk-' + ticket.id;
			const authorLogin = (ticket.author?.login ?? '').toLowerCase();
			const authorEmail = (ticket.author?.email ?? '').toLowerCase();
			const matchesSearch =
				!hasSearch ||
				ticketId.includes(normalizedSearch) ||
				ticket.title.toLowerCase().includes(normalizedSearch) ||
				ticket.description.toLowerCase().includes(normalizedSearch) ||
				authorLogin.includes(normalizedSearch) ||
				authorEmail.includes(normalizedSearch);

			const matchStatus =
				currentFilterStatus === null || ticket.status === currentFilterStatus;

			const matchPriority =
				currentFilterPriority === null || ticket.priority === currentFilterPriority;

			return matchesSearch && matchStatus && matchPriority;
		});
	}, [tickets, currentFilterStatus, currentFilterPriority, searchTerm]);

	const [currentPage, setCurrentPage] = useState(1);

	const totalItems = filteredTickets.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const currentTickets = filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	const handleSelectStatus = (event: MouseEvent, element: StatusFilter) => {
		event.stopPropagation();
		setCurrentFilterStatus(element.value);
		setCurrentPage(1);
	};

	const handleSelectPriority = (event: MouseEvent, element: PriorityFilter) => {
		event.stopPropagation();
		setCurrentFilterPriority(element.value);
		setCurrentPage(1);
	};

	const handleStatusChange = async (ticketId: number, nextStatus: TicketStatus) => {
		try {
			setStatusUpdatingTicketId(ticketId);
			const updated = await updateTicketStatus(ticketId, nextStatus);
			setTickets((prev) => prev.map((ticket) => ticket.id === updated.id ? updated : ticket));
		} catch (e) {
			console.error('Erreur mise a jour statut ticket admin:', e);
			setError(t('updateTicketStatusError'));
		} finally {
			setStatusUpdatingTicketId(null);
		}
	};

	const handleDeleteTicket = async (ticketId: number) => {
		if (!window.confirm(t('deleteTicketConfirm'))) {
			return;
		}

		try {
			setDeletingTicketId(ticketId);
			await deleteTicketByAdmin(ticketId);
			setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
		} catch (e) {
			console.error('Erreur suppression ticket admin:', e);
			setError(t('deleteTicketError'));
		} finally {
			setDeletingTicketId(null);
		}
	};

	if (loading) {
		return <div className="p-4">{t('loadingTickets')}</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">{error}</div>;
	}

	return (
		<div>
			<div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
				<label className="input text-sm border rounded-lg border-gray-200 max-w-[280px]">
					<MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
					<input
						type="search"
						className="text-sm"
						value={searchTerm}
						onChange={(event) => {
							setSearchTerm(event.target.value);
							setCurrentPage(1);
						}}
						placeholder={t('searchTicketsPlaceholder')}
					/>
				</label>
				<div className="flex items-center gap-4">
					<TicketFilter label={t('statusLabel')} list={statusFilterElements} currentFilterElement={currentFilterElementStatus?.label ?? t('all')} handleSelect={handleSelectStatus} />
					<TicketFilter label={t('priorityLabel')} list={priorityFilterElements} currentFilterElement={currentFilterElementPriority?.label ?? t('all')} handleSelect={handleSelectPriority} />
				</div>
			</div>
			<div className="bg-white py-4 rounded-md shadow mt-8">
				<div className="w-full overflow-x-auto">
					<table className="min-w-[700px] w-full text-sm text-left">
						<thead className="text-gray-500 border-b">
							<tr>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('idColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('titleColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('statusColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('priorityColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('clientColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('dateColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('actionsColumn')}</th>
							</tr>
						</thead>
						<tbody>
							{
								currentTickets.map((ticket) => (
									<tr
										key={ticket.id}
										className="border-b hover:bg-cream/70 transition"
									>
										<td className="px-5 py-3 text-navy whitespace-nowrap">
											TK-{ticket.id}
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											{ticket.title}
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											<span
												className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)[0]} ${getStatusColor(ticket.status)[1]}`}>
												{getStatusText(ticket.status, t)}
											</span>
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											<span
												className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)[0]} ${getPriorityColor(ticket.priority)[1]}`}>
												{getPriorityText(ticket.priority, t)}
											</span>
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											{getTicketAuthorLabel(ticket, t('deletedUserLabel'))}
										</td>
										<td className="px-5 py-3 text-gray-500 whitespace-nowrap">
											{new Date(ticket.createdAt).toLocaleDateString(i18n.language).replace(/\//g, '-')}
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<select
													value={ticket.status}
													disabled={statusUpdatingTicketId === ticket.id || deletingTicketId === ticket.id}
													onChange={(event) => void handleStatusChange(ticket.id, event.target.value as TicketStatus)}
													className="px-2 py-1 rounded border border-gray-300 text-xs bg-white"
												>
													<option value={TicketStatus.OPEN}>{t('statusOpen')}</option>
													<option value={TicketStatus.IN_PROGRESS}>{t('statusInProgress')}</option>
													<option value={TicketStatus.RESOLVED}>{t('statusResolved')}</option>
													<option value={TicketStatus.CLOSED}>{t('statusClosed')}</option>
												</select>
												<button
													type="button"
													onClick={() => navigate('/chat_ticket?ticketId=' + ticket.id, {state: {ticket}})}
													className="p-2 rounded hover:bg-gray-100"
													aria-label={t('openTicketAction')}
												>
													<EyeIcon className="w-4 h-4 text-navy" />
												</button>
												<button
													type="button"
													onClick={() => void handleDeleteTicket(ticket.id)}
													disabled={deletingTicketId === ticket.id}
													className="p-2 rounded hover:bg-red-50 disabled:opacity-50"
													aria-label={t('deleteTicketAction')}
												>
													<TrashIcon className="w-4 h-4 text-red-500" />
												</button>
											</div>
										</td>
									</tr>
								))
							}
						</tbody>
					</table>
				</div>
				<TicketsFooter
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					onNext={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
					onPrev={() => setCurrentPage((page) => Math.max(page - 1, 1))}
				/>
			</div>
		</div>
	);
}
