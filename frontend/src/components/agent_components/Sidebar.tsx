import {LayoutDashboard, Ticket, Users, Settings, LogOut, Bell} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {UserRole} from '../../types';
import TikeoLogo from '../client_components/TikeoLogo';

interface SidebarProps {
	currentRole: UserRole;
}

export function Sidebar({currentRole}: SidebarProps) {
	const navigate = useNavigate();
	const location = useLocation()
	const username = localStorage.getItem('username') || 'Utilisateur';

	const handleLogout = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('username');
		localStorage.removeItem('user_role');
		navigate('/login');
	};

	const menuItems = [
		{id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]},
		{id: 'tickets', label: 'Tickets', icon: Ticket, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]},
		{id: 'users', label: 'Utilisateurs', icon: Users, roles: [UserRole.ADMIN]},
		{id: 'notifications', label: 'Notifications', icon: Bell, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]},
		{id: 'settings', label: 'Paramètres', icon: Settings, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT]}
	];

	const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));

	return (
		<aside className="w-64 border-r h-screen flex flex-col bg-white border-gray-200">
			<div className="p-4">
				<TikeoLogo href="/client" color="text-navy" size="text-4xl" />
			</div>
			{/* Navigation */}
			<nav className="flex-1 p-4 space-y-1">
				{
					filteredItems.map((item) => {
						const Icon = item.icon;
						const targetPath = `/agent/${item.id}`;
						const isActive = location.pathname === targetPath;

						return (
							<button
								key={item.id}
								onClick={() => navigate(targetPath)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
								${isActive
										? 'bg-indigo-50 text-indigo-600'
										: 'text-gray-700 hover:bg-gray-50'
									}
								`}
							>
								<Icon className="w-5 h-5" />
								<span className="font-medium">{item.label}</span>
							</button>
						);
					})
				}
			</nav >

			{/* User Info */}
			< div className="p-4 border-t border-gray-200">
				<div className="flex items-center gap-3 mb-3">
					<img
						src="https://api.dicebear.com/7.x/avataaars/svg?seed=current"
						alt="User"
						className="w-10 h-10 rounded-full"
					/>
					<div className="flex-1">
						<p className="font-medium text-sm text-gray-900">{username}</p>
						<p className="text-xs capitalize text-gray-499">{currentRole.toLowerCase()}</p>
					</div>
				</div>
				<button
					onClick={handleLogout}
					className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors text-gray-700 hover:bg-gray-48">
					<LogOut className="w-4 h-4" />
					<span>Déconnexion</span>
				</button>
			</div >
		</aside >
	);
}
