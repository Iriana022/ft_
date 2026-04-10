import {useState, useMemo, useEffect} from 'react';
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
	EyeIcon,
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
import {fetchTickets, fetchUsers} from '../../services/tickets';
import { format, subDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const avatar1 = '/assets/avatars/avatar1.jpg';

function VerticalSeparator() {
	return (
		<div className="w-[1px] h-8 bg-gray-300" />
	);
}

function AdminHeader() {
	return (
		<div className="px-4 w-full flex items-center justify-between">
			<div>
				<h3 className="text-navy">
					Tableau de bord
				</h3>
				<span className="text-xs md:text-sm">
					Bienvenue, Administrateur
				</span>
			</div>
			<div className="flex items-center gap-4">
				<Notification hasNotification={true} />
				<VerticalSeparator />
				<div className="flex items-center gap-2">
					<Avatar src={avatar1} size="sm" />
					<span className="text-sm hidden md:inline">Administrateur</span>
					<ChevronDownIcon className="w-4 h-4 text-gray-600 hidden md:inline" />
				</div>
			</div>
		</div>
	);
}

interface DrawerTogglerProps {
	isOpen: boolean,
	onClick: () => void,
};

function DrawerToggler(props: DrawerTogglerProps) {
	return (
		<button
			type="button"
			aria-label="toggle sidebar"
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

const dailyData = [
	{name: "Lun", created: 42, resolved: 35},
	{name: "Mar", created: 55, resolved: 47},
	{name: "Mer", created: 63, resolved: 58},
	{name: "Jeu", created: 49, resolved: 44},
	{name: "Ven", created: 58, resolved: 52},
	{name: "Sam", created: 36, resolved: 30},
	{name: "Dim", created: 28, resolved: 22},
];

type CreatedOrResolved = "created" | "resolved";

interface CreatedAndResolvedIndicatorProps {
	type: CreatedOrResolved,
}

function CreatedAndResolvedIndicator(props: CreatedAndResolvedIndicatorProps) {
	const text = props.type === "created" ? "Crees" : "Resolus";
	const bg = props.type === "created" ? "bg-navy" : "bg-status-resolved";
	return (
		<>
			<span className={`block w-3 h-3 ${bg} rounded-full`}></span>
			<span className="text-xs md:text-sm">{text}</span>
		</>
	);
}

const generateDailyTickets = (tickets: Ticket[]) => {
  // 1. Générer les 7 derniers jours (ex: [Ven, Jeu, Mer, Mar, Lun, Dim, Sam])
  const last7Days = [...Array(7)].map((_, i) => subDays(new Date(), i)).reverse();

  return last7Days.map((date) => {
    // 2. Formater le nom du jour (Lun, Mar...)
    const name = format(date, 'eee', { locale: fr }); // 'eee' donne 'lun.', 'mar.'...

    // 3. Compter les tickets créés ce jour-là
    const created = tickets.filter((t) => 
      isSameDay(new Date(t.createdAt), date)
    ).length;

    // 4. Compter les tickets résolus ce jour-là 
    // (en supposant que vous avez un champ updatedAt et un status RESOLVED)
    const resolved = tickets.filter((t) => 
      t.status ===  TicketStatus.RESOLVED && 
      t.updatedAt && isSameDay(new Date(t.updatedAt), date)
    ).length;

    return { 
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('.', ''), 
      created, 
      resolved 
    };
  });
};

function TicketsActivities() {
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
				setError('Impossible de charger les tickets');
			} finally {
				setLoading(false);
			}
		};

		loadTickets();
	}, []);

	if (loading) {
		return <div className="p-4">Chargement des tickets...</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">{error}</div>;
	}

	const dailyTickets = generateDailyTickets(tickets);
	console.log(dailyTickets);

	return (
		<div className="w-full md:w-[60%] bg-white shadow rounded-md p-5">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-base font-medium text-navy">Activite des tickets</h3>
					<p className="text-xs md:text-sm text-gray-600">Apercu des 7 derniers jours</p>
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
						<Line type="monotone" dataKey="created" stroke="var(--color-navy)" strokeWidth={2} name="Crees"
							dot={false}
							activeDot={{r: 5}}
						/>
						<Line type="monotone" dataKey="resolved" stroke="var(--color-status-resolved)" strokeWidth={2} name="Resolus"
							dot={false}
							activeDot={{r: 5}}
						/>
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
	return (
		<div className="flex items-center justify-between px-5 pt-3">
			<div>
				<h3 className="text-base">
					Tickets recents
				</h3>
				<p className="text-xs md:text-sm text-gray-600">Dernieres demandes de support</p>
			</div>
			{/* TODO: change this to Link component */}
			<Link to="tickets" className="block text-navy font-medium text-xs md:text-sm">
				Voir tout
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

function getStatusText(status: TicketStatus) {
	let statusText: string | undefined;
	switch (status) {
		case TicketStatus.OPEN: {
			statusText = "Ouvert";
		} break;
		case TicketStatus.IN_PROGRESS: {
			statusText = "En cours";
		} break;
		case TicketStatus.RESOLVED: {
			statusText = "Resolu";
		} break;
		case TicketStatus.CLOSED: {
			statusText = "Ferme";
		} break;
		default: {
			throw new Error("Unkown ticket status");
		}
	}
	return (statusText);
}

function getPriorityText(priority: TicketPriority) {
	let priorityText: string | undefined;
	switch (priority) {
		case TicketPriority.LOW: {
			priorityText = "Basse";
		} break;
		case TicketPriority.MEDIUM: {
			priorityText = "Moyenne";
		} break;
		case TicketPriority.HIGH: {
			priorityText = "Haute";
		} break;
		case TicketPriority.URGENT: {
			priorityText = "Urgent";
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

function RecentTickets() {
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
				setError('Impossible de charger les tickets');
			} finally {
				setLoading(false);
			}
		};

		loadTickets();
	}, []);

	return (
		<div className="bg-white rounded-md shadow mt-8">
			<RecentTicketsHeader />
			<Separator />

			<div className="w-full overflow-x-auto">
				<table className="min-w-[700px] w-full text-sm text-left">
					<thead className="text-gray-500 border-b">
						<tr>
							<th className="px-5 pb-3 font-medium">ID</th>
							<th className="px-5 pb-3 font-medium">Titre</th>
							<th className="px-5 pb-3 font-medium">Utilisateur</th>
							<th className="px-5 pb-3 font-medium">Status</th>
							<th className="px-5 pb-3 font-medium">Priorité</th>
							<th className="px-5 pb-3 font-medium">Date</th>
						</tr>
					</thead>

					<tbody>
						{loading ? (
							<tr>
								<td colSpan={6} className="text-center py-6 text-gray-400">
									Chargement des tickets...
								</td>
							</tr>
						) : error ? (
							<tr>
								<td colSpan={6} className="text-center py-6 text-red-400">
									{error}
								</td>
							</tr>
						) : tickets.length === 0 ? (
							<tr>
								<td colSpan={6} className="text-center py-6 text-gray-400">
									Aucun ticket disponible
								</td>
							</tr>
						) : (
							[...tickets]
								.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
								.slice(0, 5)
								.map((ticket) => (
									<tr
										key={ticket.id}
										className="border-b hover:bg-cream/70 transition"
									>
										<td className="px-5 py-3 text-navy">
											TK-{ticket.id}
										</td>

										<td className="px-5 py-3">
											{ticket.title}
										</td>

										<td className="px-5 py-3">
											{ticket.author?.login ?? "N/A"}
										</td>

										<td className="px-5 py-3">
											<span
												className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)[0]
													} ${getStatusColor(ticket.status)[1]}`}
											>
												{getStatusText(ticket.status)}
											</span>
										</td>

										<td className="px-5 py-3">
											<span
												className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)[0]
													} ${getPriorityColor(ticket.priority)[1]}`}
											>
												{getPriorityText(ticket.priority)}
											</span>
										</td>

										<td className="px-5 py-3 text-gray-500">
											{ticket.createdAt
												.toLocaleDateString("fr-FR")
												.replace(/\//g, "-")}
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
	}, []);

	const openTickets = tickets.filter((t) => t.status === TicketStatus.OPEN);
	const closedTickets = tickets.filter((t) => t.status === TicketStatus.CLOSED);

	return (
		<div className="p-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				<StatCard
					title="Total tickets"
					count={tickets.length}
					icon={TicketIcon}
					type={StatCardType.TOTAL_TICKET}
				/>
				<StatCard
					title="Tickets ouverts"
					count={openTickets.length}
					icon={ClockIcon}
					type={StatCardType.OPEN_TICKET}
				/>
				<StatCard
					title="Tickets fermes"
					count={closedTickets.length}
					icon={TicketIcon}
					type={StatCardType.CLOSED_TICKET}
				/>
				<StatCard
					title="Utilisateurs"
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
	const start = (props.currentPage - 1) * 8 + 1;
	const end = Math.min(props.currentPage * 8, props.totalItems);

	return (
		<div className="px-5 pt-3 flex items-center justify-between">
			<span className="text-xs md:text-sm text-gray-600">
				Affichage {start}-{end} sur {props.totalItems} tickets
			</span>
			<div className="flex items-center gap-3">
				<button
					onClick={props.onPrev}
					disabled={props.currentPage == 1}
					className="btn text-xs md:text-sm font-medium disabled:opacity-50 rounded-lg border border-1 bg-cream text-gray-600"
				>
					Precedent
				</button>
				<button
					onClick={props.onNext}
					disabled={props.currentPage === props.totalPages}
					className="btn text-xs md:text-sm font-medium disabled:opacity-50 rounded-lg border border-1 bg-cream text-gray-600"
				>
					Suivant
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
	// TODO: refactor this code
	const statusFilterElements = [
		{label: "Tous", value: null},
		{label: "Ouverts", value: TicketStatus.OPEN},
		{label: "En cours", value: TicketStatus.IN_PROGRESS},
		{label: "Résolus", value: TicketStatus.RESOLVED},
		{label: "Fermés", value: TicketStatus.CLOSED},
	];

	const priorityFilterElements = [
		{label: "Tous", value: null},
		{label: "Basses", value: TicketPriority.LOW},
		{label: "Moyennes", value: TicketPriority.MEDIUM},
		{label: "Hautes", value: TicketPriority.HIGH},
		{label: "Urgentes", value: TicketPriority.URGENT},
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
				setError('Impossible de charger les tickets');
			} finally {
				setLoading(false);
			}
		};

		loadTickets();
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
		return <div className="p-4">Chargement des tickets...</div>;
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
					<input type="search" className="text-sm" required placeholder="Rechercher des tickets" />
				</label>
				<div className="flex items-center gap-4">
					<TicketFilter label="Status" list={statusFilterElements} currentFilterElement={currentFilterElementStatus?.label ?? "Tous"} handleSelect={handleSelectStatus} />
					<TicketFilter label="Priorite" list={priorityFilterElements} currentFilterElement={currentFilterElementPriority?.label ?? "Tous"} handleSelect={handleSelectPriority} />
				</div>
			</div>
			<div className="bg-white py-4 rounded-md shadow mt-8">
				<div className="w-full overflow-x-auto">
					<table className="min-w-[700px] w-full text-sm text-left">
						<thead className="text-gray-500 border-b">
							<tr>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">ID</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Titre</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Statut</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Priorite</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Utilisateur</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Date</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Actions</th>
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
												{getStatusText(ticket.status)}
											</span>
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											<span
												className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)[0]} ${getPriorityColor(ticket.priority)[1]}`}>
												{getPriorityText(ticket.priority)}
											</span>
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											{ticket.author.login ?? ticket.author.email}
										</td>
										<td className="px-5 py-3 text-gray-500 whitespace-nowrap">
											{new Date(ticket.createdAt).toLocaleDateString("fr-FR").replace(/\//g, "-")}
										</td>
										<td className="px-5 py-3 text-gray-500 whitespace-nowrap flex items-center gap-5">
											<ActionIcon icon={EyeIcon} className="w-3 h-4" />
											<ActionIcon icon={TrashIcon} className="w-4 h-4 text-red-500" />
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

function getRoleString(role: UserRole): string {
	let roleString: string = "";

	switch (role) {
		case UserRole.CLIENT: {
			roleString = "Client";
		} break;
		case UserRole.AGENT: {
			roleString = "Agent";
		} break;
		case UserRole.ADMIN: {
			roleString = "Admin";
		}
	}
	return (roleString);
}

export function AdminUsers() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadUsers = async () => {
			try {
				setLoading(true);
				const data = await fetchUsers();
				setUsers(data);
				setError(null);
			} catch (e) {
				console.error('Erreur chargement tickets admin:', e);
				setError('Impossible de charger les tickets');
			} finally {
				setLoading(false);
			}
		};

		loadUsers();
	}, []);

	if (loading) {
		return <div className="p-4">Chargement des tickets...</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">{error}</div>;
	}
	console.log(users);
	
	return (
		<div>
			<label className="hidden md:flex input text-sm bg-white rounded-lg border border-gray-200 max-w-[280px]">
				<MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
				<input type="search" className="text-sm" required placeholder="Rechercher des utilisateurs" />
			</label>

			<div className="bg-white rounded-md shadow mt-8 pt-3">
				<div className="w-full overflow-x-auto">
					<table className="min-w-[700px] w-full text-sm text-left">
						<thead className="text-gray-500 border-b">
							<tr>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Utilisateurs</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Role</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Tickets</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Inscription</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">Actions</th>
							</tr>
						</thead>

						<tbody>
							{
								users.map((user) => (
									<tr
										key={user.id}
										className="border-b hover:bg-cream/70 transition"
									>
										<td className="px-5 py-3 text-navy whitespace-nowrap flex items-center gap-2">
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
												{getRoleString(user.role)}
											</span>
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											{user.role == UserRole.CLIENT ? user.ticketsCreated.length : '-'}
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											{user.createdAt.toLocaleDateString("fr-FR").replace(/\//g, "-")}
										</td>
										<td className="px-5 py-3 flex">
											<ActionIcon icon={TrashIcon} className="w-4 h-4 text-red-500" />
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
	return (
		<div>
			Stats
		</div>
	);
}

interface DrawerSideContentProps {
	isOpen: boolean,
	setIsOpen: (s: boolean) => void,
}

function DrawerSideContent(props: DrawerSideContentProps) {
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
						data-tip="Tableau de bord"
						onClick={handleNavClick}
					>
						<Squares2X2Icon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">Tableau de bord</span>
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
						data-tip="Tickets"
						onClick={handleNavClick}
					>
						<TicketIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">Tickets</span>
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
						data-tip="Users"
						onClick={handleNavClick}
					>
						<UsersIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">Utilisateurs</span>
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
						data-tip="Statistiques"
						onClick={handleNavClick}
					>
						<ChartBarSquareIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">Statistiques</span>
					</NavLink>
				</li>
			</ul>
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
