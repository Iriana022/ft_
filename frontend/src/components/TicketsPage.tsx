import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import type { Ticket } from '../types';
import { TicketStatus, Priority } from '../types';
import { mockTickets } from '../data/mockData';
import { TicketList } from './TicketList';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export function TicketsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('OPEN');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');

  // Filter tickets
  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className={`flex-1 overflow-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b px-8 py-6 ${
        isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Tous les tickets</h1>
            <p className={isDark ? 'text-gray-400 mt-1' : 'text-gray-600 mt-1'}>
              Gérez et suivez tous vos tickets de support
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Rechercher un ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'ALL')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
            >
              <option value="ALL">Tous les statuts</option>
              <option value={TicketStatus.OPEN}>Ouvert</option>
              <option value={TicketStatus.IN_PROGRESS}>En cours</option>
              <option value={TicketStatus.RESOLVED}>Résolu</option>
              <option value={TicketStatus.CLOSED}>Fermé</option>
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'ALL')}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
          >
            <option value="ALL">Toutes les priorités</option>
            <option value={Priority.URGENT}>Urgent</option>
            <option value={Priority.HIGH}>Haute</option>
            <option value={Priority.MEDIUM}>Moyenne</option>
            <option value={Priority.LOW}>Basse</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Results Count */}
        <div className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {filteredTickets.length} ticket{filteredTickets.length > 1 ? 's' : ''} trouvé{filteredTickets.length > 1 ? 's' : ''}
        </div>

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <TicketList tickets={filteredTickets} />
        ) : (
          <div className={`rounded-xl border p-12 text-center ${
            isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
          }`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Search className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Aucun ticket trouvé
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
