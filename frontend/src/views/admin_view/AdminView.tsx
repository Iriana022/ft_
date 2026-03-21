import {useState} from 'react';
import {ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, MagnifyingGlassIcon} from '@heroicons/react/24/solid';
import TikeoLogo from '../../components/client_components/TikeoLogo';
import Notification from '../../components/client_components/Notification';
import Avatar from '../../components/client_components/Avatar';
import avatar1 from '../../assets/avatars/avatar1.jpg';

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
				<span className="text-sm">
					Bienvenue, Administrateur
				</span>
			</div>
			<div className="flex items-center gap-4">
				<label className="input text-sm bg-cream border border-gray-200 max-w-[280px]">
					<MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
					<input type="search" required placeholder="Rechercher" />
				</label>
				<Notification />
				<VerticalSeparator />
				<div className="flex items-center gap-2">
					<Avatar src={avatar1} size="sm" />
					<span className="text-sm">Administrateur</span>
					<ChevronDownIcon className="w-4 h-4 text-gray-600" />
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
		<label
			htmlFor="my-drawer-4"
			aria-label="open sidebar"
			className="block bg-white p-1 rounded-full shadow-sm"
			onClick={props.onClick}
		>
			{
				props.isOpen ?
					(<ChevronLeftIcon className="w-4 h-4 text-gray-600" />) :
					(<ChevronRightIcon className="w-4 h-4 text-gray-600" />)
			}
		</ label>
	);
}

function AdminView() {
	const [isOpen, setIsOpen] = useState(false);

	const handleClick = () => {
		setIsOpen(s => !s);
	}

	return (
		<div className="drawer lg:drawer-open">
			<input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content">
				<nav className="navbar w-full py-4 bg-white">
					<DrawerToggler isOpen={isOpen} onClick={handleClick} />
					<AdminHeader />
				</nav>
				<div className="p-4">
					Page Content
				</div>
			</div>

			<div className="drawer-side is-drawer-close:overflow-visible">
				<label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
				<div className="flex min-h-full flex-col items-start pt-4 px-4 bg-navy is-drawer-close:w-30 is-drawer-open:w-64">
					<TikeoLogo href="/admin" color="text-white" size="text-3xl" />
					<ul className="menu w-full grow">
						<li>
							<button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
								<span className="is-drawer-close:hidden">Homepage</span>
							</button>
						</li>
						<li>
							<button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings">
								<span className="is-drawer-close:hidden">Settings</span>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

export default AdminView;
