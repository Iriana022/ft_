import {useState, useMemo, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronDownIcon,
	MagnifyingGlassIcon,
	Bars3Icon,
	XMarkIcon,
} from '@heroicons/react/24/solid';
import {
	Squares2X2Icon,
	TicketIcon,
	UsersIcon,
	ChartBarSquareIcon,
	ClockIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import TikeoLogo from '../../components/client_components/TikeoLogo';
import Notification from '../../components/client_components/Notification';
import Avatar from '../../components/client_components/Avatar';
import {Outlet, Link, NavLink} from 'react-router-dom';
import {type HeroIconType, type Ticket, type User, TicketStatus, TicketPriority, StatCardType} from '../../types';
import {RechartsDevtools} from '@recharts/devtools';
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
	ResponsiveContainer
} from 'recharts';
import Separator from '../../components/login_components/Separator';
import TicketFilter from '../../components/client_components/TicketFilter';
import {UserRole} from '../../types';
import {fetchTickets, fetchUsers, normalizeTicket, type RawTicket, deleteUserByAdmin, fetchTicketResolutionHistory, type TicketResolutionHistoryItem} from '../../services/tickets';
import {format, subDays, isSameDay} from 'date-fns';
import {fr, enUS, es} from 'date-fns/locale';
import {getSocket} from '../../services/singleton';
import {jsPDF} from 'jspdf';
import {autoTable} from 'jspdf-autotable';
import LanguageSelector from '../../components/client_components/LanguageSelector';

const avatar1 = '/assets/avatars/avatar1.jpg';

function VerticalSeparator() {
	return (
		<div className="w-[1px] h-8 bg-gray-300" />
	);
}

function AdminHeader() {
	const {t} = useTranslation('admin');
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('username');
		localStorage.removeItem('user_role');
		localStorage.removeItem('user_avatar');
		navigate('/login');
	}

	return (
		<div className="px-4 w-full flex items-center justify-between">
			<div>
				<h3 className="text-navy">
					{t('dashboard')}
				</h3>
				<span className="text-xs md:text-sm">
					{t('welcomeAdmin')}
				</span>
			</div>
			<div className="flex items-center gap-4">
				<LanguageSelector />
				<Notification hasNotification={true} />
				<VerticalSeparator />
				<div className="flex items-center gap-2">
					<Avatar src={avatar1} size="sm" />
					<span className="text-sm hidden md:inline">Administrateur</span>
					<ChevronDownIcon className="w-4 h-4 text-gray-600 hidden md:inline" />
				</div>
				<button
					onClick={handleLogout}
					className="btn btn-primary"
				>
					{t('logout')}
				</button>
			</div>
		</div>
	);
}

interface DrawerTogglerProps {
	isOpen: boolean,
	onClick: () => void,
};

function DrawerToggler(props: DrawerTogglerProps) {
	const {t} = useTranslation('admin');
	return (
		<button
			type="button"
			aria-label={t('toggleSidebar')}
			className="bg-white p-1 rounded-full shadow-sm hidden md:block"
			onClick={props.onClick}
		>
			{props.isOpen ? (
				<ChevronLeftIcon className="w-4 h-4 text-gray-600" />
			) : (
				<ChevronRightIcon className="w-4 h-4 text-gray-600" />
			)}
		</button>
	);
}

interface AdminHamburgerMenuProps {
	isOpen: boolean,
	onClick: () => void,
}

function AdminHamburgerMenu(props: AdminHamburgerMenuProps) {
	return (
		<>
			{
				!props.isOpen &&
				(<div className="p-1 shadow-sm border rounded md:hidden" onClick={() => props.onClick()}>
					<Bars3Icon className="w-6 h-6" />
				</div>)
			}
		</>
	);
}

interface StatCardProps {
	title: string,
	count: number,
	type: StatCardType,
	icon: HeroIconType,
}

function StatCard(props: StatCardProps) {
	let colorIcon: string | undefined = undefined;
	let bgIcon: string | undefined = undefined;

	switch (props.type) {
		case StatCardType.TOTAL_TICKET:
			colorIcon = "text-gray-600";
			bgIcon = "bg-blue-500/25";
			break;
		case StatCardType.OPEN_TICKET:
			colorIcon = "text-gray-600";
			bgIcon = "bg-green-500/25";
			break;
		case StatCardType.CLOSED_TICKET:
			colorIcon = "text-gray-600";
			bgIcon = "bg-red-500/25";
			break;
		case StatCardType.USERS:
			colorIcon = "text-gray-600";
			bgIcon = "bg-indigo-500/25";
			break;
		case StatCardType.CATEGORIES:
			colorIcon = "text-gray-600";
			bgIcon = "bg-yellow-400/25";
			break;
		default:
			colorIcon = "text-gray-500";
			bgIcon = "bg-gray-300/25";
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

type CreatedOrResolved = "created" | "resolved";

interface CreatedAndResolvedIndicatorProps {
	type: CreatedOrResolved,
}

function CreatedAndResolvedIndicator(props: CreatedAndResolvedIndicatorProps) {
	const {t} = useTranslation('admin');
	const text = props.type === "created" ? t('created') : t('resolved');
	const bg = props.type === "created" ? "bg-navy" : "bg-status-resolved";
	return (
		<>
			<span className={`block w-3 h-3 ${bg} rounded-full`}></span>
			<span className="text-xs md:text-sm">{text}</span>
		</>
	);
}

const generateDailyTickets = (
	tickets: Ticket[],
	resolutionHistory: TicketResolutionHistoryItem[],
	language: string,
) => {
	const locale = language.startsWith('es') ? es : language.startsWith('en') ? enUS : fr;
	const last7Days = [...Array(7)].map((_, i) => subDays(new Date(), i)).reverse();

	return last7Days.map((date) => {
		const name = format(date, 'eee', {locale});

		const created = tickets.filter((t) =>
			isSameDay(new Date(t.createdAt), date)
		).length;

		const resolved = resolutionHistory.filter((h) =>
			h.toStatus === TicketStatus.RESOLVED &&
			isSameDay(new Date(h.changedAt), date)
		).length;

		return {
			name: name.charAt(0).toUpperCase() + name.slice(1).replace('.', ''),
			created,
			resolved
		};
	});
};

function TicketsActivities() {
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

		loadTickets();
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
	}, []);

	if (loading) {
		return <div className="p-4">{t('loadingTickets')}</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">{error}</div>;
	}

	const dailyTickets = generateDailyTickets(tickets, resolutionHistory, i18n.language);

	return (
		<div className="w-full md:w-[60%] bg-white shadow rounded-md p-5">
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
			<div className="mt-8 w-full aspect-[5/3] md:aspect-[3/1]">
				<ResponsiveContainer>
					<LineChart responsive data={dailyTickets}>
						<CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
						<Line type="monotone" dataKey="created" stroke="var(--color-navy)" strokeWidth={2} name={t('created')} dot={false} activeDot={{r: 5}} />
						<Line type="monotone" dataKey="resolved" stroke="var(--color-status-resolved)" strokeWidth={2} name={t('resolved')} dot={false} activeDot={{r: 5}} />
						<XAxis dataKey="name" tick={{fontSize: 12}} />
						<YAxis tick={{fontSize: 12}} />
						<Tooltip />
						<RechartsDevtools />
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
			{/* TODO: change this to Link component */}
			<Link to="tickets" className="block text-navy font-medium text-xs md:text-sm">
				{t('viewAll')}
			</Link>
		</div>
	);
}

function getStatusColor(status: TicketStatus) {
	let color: [string, string] = ["", ""];
	switch (status) {
		case TicketStatus.OPEN: {
			color[0] = "bg-status-open/25"; // bg-color
			color[1] = "text-status-open"; // text-color
		} break;
		case TicketStatus.IN_PROGRESS: {
			color[0] = "bg-status-in-progress/25";
			color[1] = "text-status-in-progress";
		} break;
		case TicketStatus.RESOLVED: {
			color[0] = "bg-status-resolved/25";
			color[1] = "text-status-resolved";
		} break;
		case TicketStatus.CLOSED: {
			color[0] = "bg-status-closed/25";
			color[1] = "text-status-closed";
		} break;
		default: {
			throw new Error("Unkown ticket status");
		}
	}
	return (color);
}

function getStatusText(status: TicketStatus, t: (key: string) => string) {
	let statusText: string | undefined;
	switch (status) {
		case TicketStatus.OPEN: {
			statusText = t('statusOpen');
		} break;
		case TicketStatus.IN_PROGRESS: {
			statusText = t('statusInProgress');
		} break;
		case TicketStatus.RESOLVED: {
			statusText = t('statusResolved');
		} break;
		case TicketStatus.CLOSED: {
			statusText = t('statusClosed');
		} break;
		default: {
			throw new Error("Unkown ticket status");
		}
	}
	return (statusText);
}

function getPriorityText(priority: TicketPriority, t: (key: string) => string) {
	let priorityText: string | undefined;
	switch (priority) {
		case TicketPriority.LOW: {
			priorityText = t('priorityLow');
		} break;
		case TicketPriority.MEDIUM: {
			priorityText = t('priorityMedium');
		} break;
		case TicketPriority.HIGH: {
			priorityText = t('priorityHigh');
		} break;
		case TicketPriority.URGENT: {
			priorityText = t('priorityUrgent');
		} break;
		default: {
			throw new Error("Unkown ticket priority");
		}
	}
	return (priorityText);
}

function getPriorityColor(priority: TicketPriority): [string, string] {
	let color: [string, string] = ["", ""];

	switch (priority) {
		case TicketPriority.LOW: {
			color[0] = "bg-green-100";
			color[1] = "text-green-700";
		} break;

		case TicketPriority.MEDIUM: {
			color[0] = "bg-yellow-100";
			color[1] = "text-yellow-700";
		} break;

		case TicketPriority.HIGH: {
			color[0] = "bg-orange-100";
			color[1] = "text-orange-700";
		} break;

		case TicketPriority.URGENT: {
			color[0] = "bg-red-100";
			color[1] = "text-red-700";
		} break;

		default: {
			throw new Error("Unknown ticket priority");
		}
	}
	return color;
}

function upsertTicketFromSocket(prev: Ticket[], payload: RawTicket): Ticket[] {
	const nextTicket = normalizeTicket(payload);
	const exists = prev.some((t) => t.id === nextTicket.id);
	if (!exists) {
		return [nextTicket, ...prev];
	}

	return prev.map((t) => (t.id === nextTicket.id ? {...t, ...nextTicket} : t));
}

function RecentTickets() {
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

		loadTickets();

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
	}, []);

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
										<td className="px-5 py-3">{ticket.author?.login ?? "N/A"}</td>
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
											{ticket.createdAt.toLocaleDateString(i18n.language).replace(/\//g, "-")}
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

export function AdminDashboard() {
	const {t} = useTranslation('admin');
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const loadTickets = async () => {
		try {
			const data = await fetchTickets();
			setTickets(data);
		} catch (error) {
			console.error('Erreur chargement tickets:', error);
		}
	};

	const loadUsers = async () => {
		try {
			const data = await fetchUsers();
			setUsers(data);
		} catch (error) {
			console.error('Erreur chargement tickets:', error);
		}
	};

	useEffect(() => {
		loadTickets();
		loadUsers();
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
	}, []);

	const openTickets = tickets.filter((t) => t.status === TicketStatus.OPEN);
	const closedTickets = tickets.filter((t) => t.status === TicketStatus.CLOSED);

	return (
		<div className="p-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				<StatCard
					title={t('totalTickets')}
					count={tickets.length}
					icon={TicketIcon}
					type={StatCardType.TOTAL_TICKET}
				/>
				<StatCard
					title={t('openTickets')}
					count={openTickets.length}
					icon={ClockIcon}
					type={StatCardType.OPEN_TICKET}
				/>
				<StatCard
					title={t('closedTickets')}
					count={closedTickets.length}
					icon={TicketIcon}
					type={StatCardType.CLOSED_TICKET}
				/>
				<StatCard
					title={t('users')}
					count={users.length}
					icon={UsersIcon}
					type={StatCardType.USERS}
				/>
			</div>
			<div className="flex flex-col md:flex-row items-center mt-6 gap-4">
				<TicketsActivities />
			</div>
			<RecentTickets />
		</div>
	);
}

interface TicketsFooterProps {
	currentPage: number,
	totalPages: number,
	totalItems: number,
	onNext: () => void;
	onPrev: () => void;
}

function TicketsFooter(props: TicketsFooterProps) {
	const {t} = useTranslation('admin');
	const start = (props.currentPage - 1) * 8 + 1;
	const end = Math.min(props.currentPage * 8, props.totalItems);

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

interface ActionIconProps {
	icon: HeroIconType,
	className: string,
}

function ActionIcon(props: ActionIconProps) {
	return (
		<div className="p-2 transition hover:bg-blue-200 rounded-full cursor-pointer">
			<props.icon className={props.className} />
		</div>
	);
}

export function AdminTickets() {
	const {t, i18n} = useTranslation('admin');
	// TODO: refactor this code
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

		loadTickets();

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
	}, []);
	const currentFilterElementStatus = statusFilterElements.find(e => e.value === currentFilterStatus);
	const currentFilterElementPriority = priorityFilterElements.find(e => e.value === currentFilterPriority);

	const filteredTickets = useMemo(() => {
		return tickets.filter((ticket) => {
			const matchStatus =
				currentFilterStatus === null || ticket.status === currentFilterStatus;

			const matchPriority =
				currentFilterPriority === null || ticket.priority === currentFilterPriority;

			return matchStatus && matchPriority;
		});
	}, [tickets, currentFilterStatus, currentFilterPriority]);
	const [currentPage, setCurrentPage] = useState(1);

	const totalItems = filteredTickets.length;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const currentTickets = filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	const handleSelectStatus = (e: React.MouseEvent, element: StatusFilter) => {
		e.stopPropagation();
		setCurrentFilterStatus(element.value);
		setCurrentPage(1);
	}

	const handleSelectPriority = (e: React.MouseEvent, element: PriorityFilter) => {
		e.stopPropagation();
		setCurrentFilterPriority(element.value);
		setCurrentPage(1);
	}
	//console.log(tickets[0]?.author?.login);

	if (loading) {
		return <div className="p-4">{t('loadingTickets')}</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">{error}</div>;
	}
	// TODO: fix the error here
	return (
		<div>
			<div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:justify-between">
				<label className="input text-sm border rounded-lg border-gray-200 max-w-[280px]">
					<MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
					<input type="search" className="text-sm" required placeholder={t('searchTicketsPlaceholder')} />
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
											{ticket.author.login ?? ticket.author.email}
										</td>
										<td className="px-5 py-3 text-gray-500 whitespace-nowrap">
											{new Date(ticket.createdAt).toLocaleDateString(i18n.language).replace(/\//g, "-")}
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
					onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
					onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
				/>
			</div>
		</div>
	);
}

function getRoleString(role: UserRole, authT: (key: string) => string, adminT: (key: string) => string): string {
	let roleString: string = "";

	switch (role) {
		case UserRole.CLIENT: {
			roleString = authT('client');
		} break;
		case UserRole.AGENT: {
			roleString = authT('agent');
		} break;
		case UserRole.ADMIN: {
			roleString = adminT('adminLabel');
		}
	}
	return (roleString);
}

export function AdminUsers() {
	const {t: authT} = useTranslation('auth');
	const {t} = useTranslation('admin');
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

	const handleDeleteUser = async (userId: number) => {
		const confirmed = window.confirm(t('deleteUserConfirm'));
		if (!confirmed) return;

		try {
			setDeletingUserId(userId);
			await deleteUserByAdmin(userId);
			setUsers((prev) => prev.filter((u) => u.id !== userId));
		} catch (e) {
			console.error('Erreur suppression utilisateur admin:', e);
			alert(t('deleteUserError'));
		} finally {
			setDeletingUserId(null);
		}
	};
	useEffect(() => {
		const loadUsers = async () => {
			try {
				setLoading(true);
				const data = await fetchUsers();
				setUsers(data);
				setError(null);
			} catch (e) {
				console.error('Erreur chargement tickets admin:', e);
				setError(t('loadUsersError'));
			} finally {
				setLoading(false);
			}
		};

		loadUsers();
	}, []);

	if (loading) {
		return <div className="p-4">{t('loadingUsers')}</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">{error}</div>;
	}
	console.log(users);

	return (
		<div>
			<label className="hidden md:flex input text-sm bg-white rounded-lg border border-gray-200 max-w-[280px]">
				<MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
				<input type="search" className="text-sm" required placeholder={t('searchUsersPlaceholder')} />
			</label>

			<div className="bg-white rounded-md shadow mt-8 pt-3">
				<div className="w-full overflow-x-auto">
					<table className="min-w-[700px] w-full text-sm text-left">
						<thead className="text-gray-500 border-b">
							<tr>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('usersColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('roleColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('ticketsColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('registrationColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('actionsColumn')}</th>
							</tr>
						</thead>

						<tbody>
							{
								users.map((user) => (
									<tr
										key={user.id}
										className="border-b hover:bg-cream/70 transition"
									>
										<td className="px-5 py-4 text-navy whitespace-nowrap flex items-center gap-2">
											<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
												<span className="text-base font-medium uppercase">{user.login.slice(0, 2)}</span>
											</div>
											<div className="flex flex-col">
												<span className="text-sm font-semibold">{user.login}</span>
												<span className="text-xs">{user.email}</span>
											</div>
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											<span className="badge bg-gray-200 text-xs p-2 rounded-full">
												{getRoleString(user.role, authT, t)}
											</span>
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											{user.role == UserRole.CLIENT ? user.ticketsCreated.length : '-'}
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											{user.createdAt.toLocaleDateString("fr-FR").replace(/\//g, "-")}
										</td>
										<td className="px-5 py-3 flex">
											<button
												type="button"
												onClick={() => void handleDeleteUser(user.id)}
												disabled={deletingUserId === user.id}
												className="p-2 transition hover:bg-blue-200 rounded-full disabled:opacity-50"
												aria-label={t('delete')}
											>
												{
													user.role !== UserRole.ADMIN ?
														(<TrashIcon className="w-4 h-4 text-red-500" />) :
														''
												}
											</button>
										</td>
									</tr>
								))
							}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export function AdminStats() {
	const {t, i18n} = useTranslation('admin');
	const [isExporting, setIsExporting] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);

	const handleExportPdf = async () => {
		try {
			setIsExporting(true);
			setExportError(null);

			const [tickets, users, resolutionHistory] = await Promise.all([
				fetchTickets(),
				fetchUsers(),
				fetchTicketResolutionHistory(7),
			]);

			const doc = new jsPDF({
				orientation: 'landscape',
				unit: 'pt',
				format: 'a4',
			});

			const generatedAt = new Date();

			doc.setFontSize(18);
			doc.text('Tikeo - Admin Report', 40, 40);

			doc.setFontSize(10);
			doc.text(
				t('generatedOn') + ': ' + generatedAt.toLocaleString(i18n.language),
				40,
				58
			);

			const totalTickets = tickets.length;
			const openTickets = tickets.filter((ticket) => ticket.status === TicketStatus.OPEN).length;
			const inProgressTickets = tickets.filter((ticket) => ticket.status === TicketStatus.IN_PROGRESS).length;
			const resolvedTickets = tickets.filter((ticket) => ticket.status === TicketStatus.RESOLVED).length;
			const closedTickets = tickets.filter((ticket) => ticket.status === TicketStatus.CLOSED).length;

			autoTable(doc, {
				startY: 76,
				head: [[t('metric'), t('value')]],
				body: [
					[t('totalTickets'), String(totalTickets)],
					[t('openPlural'), String(openTickets)],
					[t('inProgressPlural'), String(inProgressTickets)],
					[t('resolvedPlural'), String(resolvedTickets)],
					[t('closedPlural'), String(closedTickets)],
					[t('users'), String(users.length)],
				],
				styles: {fontSize: 10},
				headStyles: {fillColor: [22, 56, 95]},
			});

			const dailyActivity = generateDailyTickets(tickets, resolutionHistory, i18n.language);

			autoTable(doc, {
				startY: (doc as any).lastAutoTable.finalY + 16,
				head: [[t('day'), t('created'), t('resolved')]],
				body: dailyActivity.map((item) => [
					item.name,
					String(item.created),
					String(item.resolved),
				]),
				styles: {fontSize: 9},
				headStyles: {fillColor: [46, 139, 87]},
			});

			const ticketRows = [...tickets]
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
				.map((ticket) => [
					'TK-' + ticket.id,
					ticket.title,
					getStatusText(ticket.status, t),
					getPriorityText(ticket.priority, t),
					ticket.author?.login ?? ticket.author?.email ?? 'N/A',
					ticket.createdAt.toLocaleDateString(i18n.language).replace(/\//g, '-'),
				]);

			autoTable(doc, {
				startY: (doc as any).lastAutoTable.finalY + 16,
				head: [[t('idColumn'), t('titleColumn'), t('statusColumn'), t('priorityColumn'), t('clientColumn'), t('dateColumn')]],
				body: ticketRows.length > 0 ? ticketRows : [[t('noTickets'), '', '', '', '', '']],
				styles: {fontSize: 8, cellPadding: 4},
				headStyles: {fillColor: [22, 56, 95]},
				columnStyles: {
					0: {cellWidth: 55},
					1: {cellWidth: 220},
					2: {cellWidth: 90},
					3: {cellWidth: 90},
					4: {cellWidth: 130},
					5: {cellWidth: 90},
				},
			});

			const datePart = generatedAt.toISOString().slice(0, 10);
			doc.save('tikeo-admin-report-' + datePart + '.pdf');
		} catch (error) {
			console.error('PDF export error:', error);
			setExportError(t('exportPdfError'));
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="bg-white rounded-md shadow p-5">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<div>
					<h3 className="text-base text-navy font-medium">{t('sidebarStats')}</h3>
					<p className="text-sm text-gray-500">{t('exportPdfDescription')}</p>
				</div>

				<button
					type="button"
					className="btn btn-primary"
					onClick={() => void handleExportPdf()}
					disabled={isExporting}
				>
					{isExporting ? t('exportingPdf') : t('exportPdf')}
				</button>
			</div>

			{exportError ? (
				<p className="text-sm text-red-600 mt-3">{exportError}</p>
			) : null}
		</div>
	);
}

interface DrawerSideContentProps {
	isOpen: boolean,
	setIsOpen: (s: boolean) => void,
}

function DrawerSideContent(props: DrawerSideContentProps) {
	const {t} = useTranslation('admin');
	const handleNavClick = () => {
		if (window.innerWidth < 1024) {
			props.setIsOpen(false);
		}
	}

	return (
		<div className="flex min-h-full flex-col items-start pt-4 px-4 bg-navy is-drawer-close:w-30 is-drawer-open:w-64">
			<div className="flex items-center w-full justify-between">
				<TikeoLogo href="/admin" color="text-white" size="text-3xl" />
				{
					props.isOpen &&
					<XMarkIcon className="w-6 h-6 text-white" onClick={() => props.setIsOpen(false)} />
				}
			</div>
			<Separator color="bg-white/25" />
			<ul className="menu w-full grow gap-1 mt-10">
				<li>
					<NavLink
						to="/admin"
						end
						className={({isActive}) =>
							`is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal transition
							 ${isActive ? "bg-sky/25" : ""}
							 focus:bg-sky/50
							`
						}
						data-tip={t('sidebarDashboard')}
						onClick={handleNavClick}
					>
						<Squares2X2Icon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">{t('sidebarDashboard')}</span>
					</NavLink>
				</li>
				<li>
					<NavLink
						to="tickets"
						className={({isActive}) =>
							`is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal transition
								${isActive ? "bg-sky/25" : ""}
								focus:bg-sky/25
							`
						}
						data-tip={t('sidebarTickets')}
						onClick={handleNavClick}
					>
						<TicketIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">{t('sidebarTickets')}</span>
					</NavLink>
				</li>
				<li>
					<NavLink
						to="users"
						className={({isActive}) =>
							`is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal transition
								${isActive ? "bg-sky/25" : ""}
								focus:bg-sky/25
							`
						}
						data-tip={t('sidebarUsers')}
						onClick={handleNavClick}
					>
						<UsersIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">{t('sidebarUsers')}</span>
					</NavLink>
				</li>
				<li>
					<NavLink
						to="stats"
						className={({isActive}) =>
							`is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal transition
							${isActive ? "bg-sky/25" : ""}
							focus:bg-sky/25
							`
						}
						data-tip={t('sidebarStats')}
						onClick={handleNavClick}
					>
						<ChartBarSquareIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">{t('sidebarStats')}</span>
					</NavLink>
				</li>
			</ul>
			<Separator color="bg-white/25" />
			<div className="mt-auto pb-10 w-full flex flex-col items-center is-drawer-close:items-center is-drawer-open:items-start">
				<Avatar src={avatar1} size="md" />
				<div className="flex flex-col mt-2 is-drawer-close:hidden">
					<span className="text-sm text-white">{t('adminLabel')}</span>
					<span className="text-xs text-white/70">
						tikeoadmin@tikeo.com
					</span>
				</div>
			</div>
		</div>
	);
}

export function AdminView() {
	const [isOpen, setIsOpen] = useState(false);

	const handleClick = () => {
		setIsOpen(s => !s);
	}

	return (
		<>
			<div className="drawer lg:drawer-open">
				<input id="my-drawer-4" type="checkbox" className="drawer-toggle"
					checked={isOpen} onChange={() => setIsOpen(s => !s)}
				/>
				<div className="drawer-content">
					<nav className="navbar w-full py-4 bg-white">
						<AdminHamburgerMenu isOpen={isOpen} onClick={handleClick} />
						<DrawerToggler isOpen={isOpen} onClick={handleClick} />
						<AdminHeader />
					</nav>
					<div className="p-4">
						<Outlet />
					</div>
				</div>

				<div className="drawer-side is-drawer-close:overflow-visible text-white">
					<label className="drawer-overlay" onClick={() => setIsOpen(false)}>
					</label>
					<DrawerSideContent isOpen={isOpen} setIsOpen={setIsOpen} />
				</div >
			</div >
		</>
	);
}
