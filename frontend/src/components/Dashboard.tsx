import { Ticket, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { TicketList } from './TicketList';
import { ThemeToggle } from './ThemeToggle';
import { mockTickets, getTicketStats, getChartData } from '../data/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const stats = getTicketStats();
  const chartData = getChartData();

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
      <div className="p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <StatCard
            title="Résolus"
            value={stats.resolved}
            icon={CheckCircle2}
            color="green"
          />
        </div>

        {/* Recent Tickets */}
        <TicketList tickets={mockTickets} maxItems={5} />

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-600/20' : 'bg-indigo-50'}`}>
                <Clock className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <h4 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Temps moyen de résolution</h4>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.avgResolutionTime}</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>-20% par rapport au mois dernier</p>
          </div>

          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-green-600/20' : 'bg-green-50'}`}>
                <CheckCircle2 className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <h4 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Taux de satisfaction</h4>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>94%</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Basé sur 48 évaluations</p>
          </div>

          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-600/20' : 'bg-orange-50'}`}>
                <AlertCircle className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <h4 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Tickets urgents</h4>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{stats.byPriority.urgent}</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Nécessitent une attention immédiate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
