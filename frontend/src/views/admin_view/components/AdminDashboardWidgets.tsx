import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {RechartsDevtools} from '@recharts/devtools';
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
	ResponsiveContainer
} from 'recharts';
import Separator from '../../../components/login_components/Separator';
import {type HeroIconType, type Ticket, StatCardType} from '../../../types';
import {fetchTickets, fetchTicketResolutionHistory, type RawTicket, type TicketResolutionHistoryItem} from '../../../services/tickets';
import {getSocket} from '../../../services/singleton';
import {
	generateDailyTickets,
	getPriorityColor,
	getPriorityText,
	getStatusColor,
	getStatusText,
	upsertTicketFromSocket,
} from '../adminHelpers';

interface StatCardProps {
	title: string,
	count: number,
	type: StatCardType,
	icon: HeroIconType,
}

export function StatCard(props: StatCardProps) {
	let colorIcon: string | undefined = undefined;
	let bgIcon: string | undefined = undefined;

	switch (props.type) {
		case StatCardType.TOTAL_TICKET:
			colorIcon = 'text-gray-600';
			bgIcon = 'bg-blue-500/25';
			break;
		case StatCardType.OPEN_TICKET:
			colorIcon = 'text-gray-600';
			bgIcon = 'bg-green-500/25';
			break;
		case StatCardType.CLOSED_TICKET:
			colorIcon = 'text-gray-600';
			bgIcon = 'bg-red-500/25';
			break;
		case StatCardType.USERS:
			colorIcon = 'text-gray-600';
			bgIcon = 'bg-indigo-500/25';
			break;
		case StatCardType.CATEGORIES:
			colorIcon = 'text-gray-600';
			bgIcon = 'bg-yellow-400/25';
			break;
		default:
			colorIcon = 'text-gray-500';
			bgIcon = 'bg-gray-300/25';
	}

	return (
		<div className="card bg-base-100 shadow-sm">
			<div className="card-body">
				<div className="flex items-center justify-between">
					<h2 className="card-title text-base text-gray-600 font-medium">{props.title}</h2>
					<div className={`${bgIcon} p-2 rounded-md`}>
						<props.icon className={`w-5 h-5 ${colorIcon}`} />
					</div>
				</div>
				<h3 className="text-2xl font-semibold">{props.count}</h3>
			</div>
		</div>
	);
}

type CreatedOrResolved = 'created' | 'resolved';

interface CreatedAndResolvedIndicatorProps {
	type: CreatedOrResolved,
}

function CreatedAndResolvedIndicator(props: CreatedAndResolvedIndicatorProps) {
	const {t} = useTranslation('admin');
	const text = props.type === 'created' ? t('created') : t('resolved');
	const bg = props.type === 'created' ? 'bg-navy' : 'bg-status-resolved';
	return (
		<>
			<span className={`block w-3 h-3 ${bg} rounded-full`}></span>
			<span className="text-xs md:text-sm">{text}</span>
		</>
	);
}

export function TicketsActivities() {
	const {t, i18n} = useTranslation('admin');
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [resolutionHistory, setResolutionHistory] = useState<TicketResolutionHistoryItem[]>([]);

	useEffect(() => {
		const loadTickets = async () => {
			try {
				setLoading(true);
				const [ticketsData, historyData] = await Promise.all([
					fetchTickets(),
					fetchTicketResolutionHistory(7),
				]);
				setTickets(ticketsData);
				setResolutionHistory(historyData);
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
			void fetchTicketResolutionHistory(7)
				.then(setResolutionHistory)
				.catch((err) => console.error('Erreur chargement historique résolution:', err));
		};

		socket.on('newTicket', onNewTicket);
		socket.on('ticketStatusUpdated', onTicketStatusUpdated);

		return () => {
			socket.off('newTicket', onNewTicket);
			socket.off('ticketStatusUpdated', onTicketStatusUpdated);
		};
	}, [t]);

	if (loading) {
		return <div className="p-4">{t('loadingTickets')}</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">{error}</div>;
	}

	const dailyTickets = generateDailyTickets(tickets, resolutionHistory, i18n.language);

	return (
		<div className="w-full md:w-[60%] bg-white shadow rounded-md p-5 min-h-[300px]">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-base font-medium text-navy">{t('ticketsActivity')}</h3>
					<p className="text-xs md:text-sm text-gray-600">{t('last7Days')}</p>
				</div>
				<div className="flex items-center gap-3 md:gap-4">
					<div className="flex items-center gap-1 md:gap-2">
						<CreatedAndResolvedIndicator type="created" />
					</div>
					<div className="flex items-center gap-1 md:gap-2">
						<CreatedAndResolvedIndicator type="resolved" />
					</div>
				</div>
			</div>
			<div className="mt-8 w-full min-h-[200px]">
				<ResponsiveContainer width="100%" height={200}>
					<LineChart data={dailyTickets}>
						<CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
						<Line type="monotone" dataKey="created" stroke="var(--color-navy)" />
						<Line type="monotone" dataKey="resolved" stroke="var(--color-status-resolved)" />
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

function RecentTicketsHeader() {
	const {t} = useTranslation('admin');
	return (
		<div className="flex items-center justify-between px-5 pt-3">
			<div>
				<h3 className="text-base">
					{t('recentTickets')}
				</h3>
				<p className="text-xs md:text-sm text-gray-600">{t('latestSupportRequests')}</p>
			</div>
			<Link to="tickets" className="block text-navy font-medium text-xs md:text-sm">
				{t('viewAll')}
			</Link>
		</div>
	);
}

export function RecentTickets() {
	const {t, i18n} = useTranslation('admin');
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

		socket.on('newTicket', onNewTicket);
		socket.on('ticketStatusUpdated', onTicketStatusUpdated);

		return () => {
			socket.off('newTicket', onNewTicket);
			socket.off('ticketStatusUpdated', onTicketStatusUpdated);
		};
	}, [t]);

	return (
		<div className="bg-white rounded-md shadow mt-8">
			<RecentTicketsHeader />
			<Separator />
			<div className="w-full overflow-x-auto">
				<table className="min-w-[700px] w-full text-sm text-left">
					<thead className="text-gray-500 border-b">
						<tr>
							<th className="px-5 pb-3 font-medium">{t('idColumn')}</th>
							<th className="px-5 pb-3 font-medium">{t('titleColumn')}</th>
							<th className="px-5 pb-3 font-medium">{t('userColumn')}</th>
							<th className="px-5 pb-3 font-medium">{t('statusColumn')}</th>
							<th className="px-5 pb-3 font-medium">{t('priorityColumn')}</th>
							<th className="px-5 pb-3 font-medium">{t('dateColumn')}</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={6} className="text-center py-6 text-gray-400">{t('loadingTickets')}</td>
							</tr>
						) : error ? (
							<tr>
								<td colSpan={6} className="text-center py-6 text-red-400">{error}</td>
							</tr>
						) : tickets.length === 0 ? (
							<tr>
								<td colSpan={6} className="text-center py-6 text-gray-400">{t('noTickets')}</td>
							</tr>
						) : (
							[...tickets]
								.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
								.slice(0, 5)
								.map((ticket) => (
									<tr key={ticket.id} className="border-b hover:bg-cream/70 transition">
										<td className="px-5 py-3 text-navy">TK-{ticket.id}</td>
										<td className="px-5 py-3">{ticket.title}</td>
										<td className="px-5 py-3">{ticket.author?.login ?? 'N/A'}</td>
										<td className="px-5 py-3">
											<span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)[0]} ${getStatusColor(ticket.status)[1]}`}>
												{getStatusText(ticket.status, t)}
											</span>
										</td>
										<td className="px-5 py-3">
											<span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)[0]} ${getPriorityColor(ticket.priority)[1]}`}>
												{getPriorityText(ticket.priority, t)}
											</span>
										</td>
										<td className="px-5 py-3 text-gray-500">
											{ticket.createdAt.toLocaleDateString(i18n.language).replace(/\//g, '-')}
										</td>
									</tr>
								))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
