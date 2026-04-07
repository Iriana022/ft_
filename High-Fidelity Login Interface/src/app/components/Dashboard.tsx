import { Ticket, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { TicketList } from './TicketList';
import { ThemeToggle } from './ThemeToggle';
import { mockTickets, getTicketStats, getChartData } from '../data/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

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
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              + Nouveau ticket
            </button>
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
            trend={{ value: '+12% ce mois', isPositive: true }}
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
            trend={{ value: '+8% cette semaine', isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Répartition par statut</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {chartData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  border: isDark ? '1px solid #2a2a2a' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#000'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Répartition par priorité</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {chartData.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  border: isDark ? '1px solid #2a2a2a' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#000'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className={`rounded-xl border p-6 ${
          isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Activité de la semaine</h3>
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>+15% vs semaine dernière</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.weeklyActivity}>
              <XAxis 
                dataKey="day" 
                stroke={isDark ? '#6b7280' : '#9ca3af'}
              />
              <YAxis stroke={isDark ? '#6b7280' : '#9ca3af'} />
              <Tooltip contentStyle={{
                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                border: isDark ? '1px solid #2a2a2a' : '1px solid #e5e7eb',
                borderRadius: '8px',
                color: isDark ? '#fff' : '#000'
              }} />
              <Legend />
              <Bar dataKey="tickets" fill="#4F46E5" name="Tickets créés" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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