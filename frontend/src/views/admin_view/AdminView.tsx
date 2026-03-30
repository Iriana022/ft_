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
} from '@heroicons/react/24/outline';
import TikeoLogo from '../../components/client_components/TikeoLogo';
import Notification from '../../components/client_components/Notification';
import Avatar from '../../components/client_components/Avatar';
import avatar1 from '../../assets/avatars/avatar1.jpg';
import {Outlet, Link} from 'react-router-dom';

function VerticalSeparator() {
	return (
		<div
			className="w-[1px] h-8 bg-gray-300" />
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

export function AdminDashboard() {
	return (
		<div>
			Dashboard
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
					<div className="flex min-h-full flex-col items-start pt-4 px-4 bg-navy is-drawer-close:w-30 is-drawer-open:w-64">
						<div className="flex items-center w-full justify-between">
							<TikeoLogo href="/admin" color="text-white" size="text-3xl" />
							{
								isOpen &&
								<XMarkIcon className="w-6 h-6 text-white" onClick={() => setIsOpen(false)} />
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
				</div>
			</div >

		</>
	);
}
