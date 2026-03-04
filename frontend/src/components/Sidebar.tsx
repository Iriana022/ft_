import { LayoutDashboard, Ticket, Users, Settings, LogOut, BarChart3, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentRole: UserRole;
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentRole, activePage, onNavigate }: SidebarProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT] },
    { id: 'tickets', label: 'Tickets', icon: Ticket, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT] },
    { id: 'users', label: 'Utilisateurs', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT] },
    { id: 'settings', label: 'Paramètres', icon: Settings, roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.CLIENT] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className={`w-64 border-r h-screen flex flex-col ${
      isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-gray-200'
    }`}>
      {/* Logo */}
      <div className={`p-6 border-b ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`font-bold text-lg ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Support Desk</h1>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>ft_transcendance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? isDark 
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'bg-indigo-50 text-indigo-600'
                  : isDark
                    ? 'text-gray-400 hover:bg-[#1a1a1a]'
                    : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className={`p-4 border-t ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=current"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <p className={`font-medium text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Jean Dupont</p>
            <p className={`text-xs capitalize ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{currentRole.toLowerCase()}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
            isDark 
              ? 'text-gray-400 hover:bg-[#1a1a1a]'
              : 'text-gray-700 hover:bg-gray-50'
          }`}>
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
