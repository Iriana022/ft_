import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from './components/AdminHeader';
import {
	AdminHamburgerMenu,
	DrawerSideContent,
	DrawerToggler,
} from './components/AdminShell';
import Footer from '../../layout/Footer';

export { AdminDashboard } from './pages/AdminDashboardPage';
export { AdminTickets } from './pages/AdminTicketsPage';
export { AdminUsers } from './pages/AdminUsersPage';
export { AdminStats } from './pages/AdminStatsPage';

export function AdminView() {
	const [isOpen, setIsOpen] = useState(false);

	const handleClick = () => {
		setIsOpen((state) => !state);
	};

	return (
		<div className="min-h-screen flex flex-col">
			<div className="drawer lg:drawer-open flex-1">
				<input id="my-drawer-4" type="checkbox" className="drawer-toggle"
					checked={isOpen} onChange={() => setIsOpen((state) => !state)}
				/>
				<div className="drawer-content flex flex-col">
					<nav className="navbar w-full py-4 bg-white">
						<AdminHamburgerMenu isOpen={isOpen} onClick={handleClick} />
						<DrawerToggler isOpen={isOpen} onClick={handleClick} />
						<AdminHeader />
					</nav>
					<div className="p-4 flex-1">
						<Outlet />
					</div>
					<Footer />
				</div>

				<div className="drawer-side is-drawer-close:overflow-visible text-white">
					<label className="drawer-overlay" onClick={() => setIsOpen(false)}>
					</label>
					<DrawerSideContent isOpen={isOpen} setIsOpen={setIsOpen} />
				</div>
			</div>
		</div>
	);
}
