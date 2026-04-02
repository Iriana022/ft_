import {useState} from 'react';
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
	FolderMinusIcon,
	UsersIcon,
	ChartBarSquareIcon,
	ClockIcon
} from '@heroicons/react/24/outline';
import TikeoLogo from '../../components/client_components/TikeoLogo';
import Notification from '../../components/client_components/Notification';
import Avatar from '../../components/client_components/Avatar';
import avatar1 from '../../../public/assets/avatars/avatar1.jpg';
import {Outlet, Link} from 'react-router-dom';
import {type HeroIconType, StatCardType} from '../../types';
import {RechartsDevtools} from '@recharts/devtools';
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
	BarChart, Bar, ResponsiveContainer
} from 'recharts';

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
				<label className="hidden md:flex input text-sm bg-cream border border-gray-200 max-w-[280px]">
					<MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
					<input type="search" required placeholder="Rechercher" />
				</label>
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

function TicketsActivities() {
	return (
		<div className="w-full md:w-[60%] bg-white shadow rounded-md p-5">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-base font-medium text-navy">Activite des tickets</h3>
					<p className="text-sm text-gray-600">Apercu des 7 derniers jours</p>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="block w-3 h-3 bg-navy rounded-full"></span>
						<span className="text-sm">Crees</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="block w-3 h-3 bg-status-resolved rounded-full"></span>
						<span className="text-sm">Resolus</span>
					</div>
				</div>
			</div>
			<div className="mt-8 w-full aspect-[5/3] md:aspect-[3/1]">
				<ResponsiveContainer>
					<LineChart responsive data={dailyData}>
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

const ticketsPerCategory = [
	{category: "Bug", count: 45},
	{category: "Fonctionnalite", count: 30},
	{category: "Support", count: 20},
	{category: "Facturation", count: 15},
	{category: "Autre", count: 10},
];

function TicketsRepartitionPerCategory() {
	return (
		<div className="w-full md:w-[40%] bg-white shadow rounded-md p-5">
			<h3 className="text-base font-medium text-navy">Par categorie</h3>
			<p className="text-sm text-gray-600">Repartition des tickets</p>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart
					data={ticketsPerCategory}
					layout="vertical"
					margin={{top: 20, right: 20, bottom: 20, left: 40}}
				>
					<CartesianGrid stroke="#aaa" strokeDasharray="5 5" horizontal={false} vertical={true} />
					<XAxis type="number" tick={{fontSize: 12}} />
					<YAxis dataKey="category" type="category" tick={{fontSize: 12}} />
					<Tooltip />
					<Bar dataKey="count" fill="var(--color-navy)" barSize={30}
						radius={[0, 5, 5, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}

export function AdminDashboard() {
	return (
		<div className="p-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
				<StatCard
					title="Total tickets"
					count={128}
					icon={TicketIcon}
					type={StatCardType.TOTAL_TICKET}
				/>
				<StatCard
					title="Tickets ouverts"
					count={34}
					icon={ClockIcon}
					type={StatCardType.OPEN_TICKET}
				/>
				<StatCard
					title="Tickets fermes"
					count={94}
					icon={TicketIcon}
					type={StatCardType.CLOSED_TICKET}
				/>
				<StatCard
					title="Utilisateurs"
					count={256}
					icon={UsersIcon}
					type={StatCardType.USERS}
				/>
				<StatCard
					title="Categories"
					count={5}
					icon={FolderMinusIcon}
					type={StatCardType.CATEGORIES}
				/>
			</div>
			<div className="flex flex-col md:flex-row items-center mt-6 gap-4">
				<TicketsActivities />
				<TicketsRepartitionPerCategory />
			</div>
		</div>
	);
}

export function AdminTickets() {
	return (
		<div>
			Tickets
		</div>
	);
}

export function AdminCategories() {
	return (
		<div>
			Categories
		</div>
	);
}

export function AdminUsers() {
	return (
		<div>
			Users
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

function DrawerSideContent(props: DraweSideContentProps) {
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
					<Link to="/admin" className="is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal" data-tip="Tableau de bord">
						<Squares2X2Icon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">Tableau de bord</span>
					</Link>
				</li>
				<li>
					<Link to="tickets" className="is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal" data-tip="Tickets">
						<TicketIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">Tickets</span>
					</Link>
				</li>
				<li>
					<Link to="categories" className="is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal" data-tip="Categories">
						<FolderMinusIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">Categories</span>
					</Link>
				</li>
				<li>
					<Link to="users" className="is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal" data-tip="Utilisateurs">
						<UsersIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">Utilisateurs</span>
					</Link>
				</li>
				<li>
					<Link to="stats" className="is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal" data-tip="Statistiques">
						<ChartBarSquareIcon className="w-5 h-5" />
						<span className="is-drawer-close:hidden text-sm">Statistiques</span>
					</Link>
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
