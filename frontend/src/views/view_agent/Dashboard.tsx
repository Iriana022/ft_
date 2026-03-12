import { Ticket, AlertCircle, Clock } from 'lucide-react';
import { StatCard } from '../../components/agent_components/StatCard';
import { TicketList } from './TicketList';
import { ThemeToggle } from '../../components/agent_components/ThemeToggle';
import { mockTickets, getTicketStats } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';

export function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const stats = getTicketStats();

  return (
    <div className={`flex-1 overflow-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b px-8 py-6 ${
        isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Dashboard</h1>
            <p className={isDark ? 'text-gray-400 mt-1' : 'text-gray-600 mt-1'}>Vue d'ensemble de vos tickets de support</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total des tickets"
            value={stats.total}
            icon={Ticket}
            color="blue"
          />
          <StatCard
            title="Tickets ouverts"
            value={stats.open}
            icon={AlertCircle}
            color="red"
          />
          <StatCard
            title="En cours"
            value={stats.inProgress}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Recent Tickets */}
        <TicketList tickets={mockTickets} maxItems={4} />
      </div>
    </div>
  );
}
