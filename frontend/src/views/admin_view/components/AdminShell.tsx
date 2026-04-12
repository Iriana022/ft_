import { useTranslation } from 'react-i18next';
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	Bars3Icon,
	XMarkIcon,
} from '@heroicons/react/24/solid';
import {
	Squares2X2Icon,
	TicketIcon,
	UsersIcon,
	ChartBarSquareIcon,
} from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';
import TikeoLogo from '../../../components/client_components/TikeoLogo';
import Avatar from '../../../components/client_components/Avatar';
import Separator from '../../../components/login_components/Separator';

const avatar1 = '/assets/avatars/avatar1.jpg';

interface DrawerTogglerProps {
	isOpen: boolean,
	onClick: () => void,
}

export function DrawerToggler(props: DrawerTogglerProps) {
	const { t } = useTranslation('admin');
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

export function AdminHamburgerMenu(props: AdminHamburgerMenuProps) {
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

interface DrawerSideContentProps {
	isOpen: boolean,
	setIsOpen: (s: boolean) => void,
}

export function DrawerSideContent(props: DrawerSideContentProps) {
	const { t } = useTranslation('admin');
	const handleNavClick = () => {
		if (window.innerWidth < 1024) {
			props.setIsOpen(false);
		}
	};

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
						className={({ isActive }) =>
							`is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal transition
							 ${isActive ? 'bg-sky/25' : ''}
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
						className={({ isActive }) =>
							`is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal transition
								${isActive ? 'bg-sky/25' : ''}
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
						className={({ isActive }) =>
							`is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal transition
								${isActive ? 'bg-sky/25' : ''}
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
						className={({ isActive }) =>
							`is-drawer-close:tooltip is-drawer-close:tooltip-right font-normal transition
							${isActive ? 'bg-sky/25' : ''}
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
