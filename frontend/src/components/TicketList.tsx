import type { Ticket } from '../types';
import { TicketStatus, Priority } from '../types';
import { Clock, User, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TicketListProps {
  tickets: Ticket[];
  maxItems?: number;
}

const statusConfig = {
  [TicketStatus.OPEN]: { label: 'Ouvert', color: 'bg-red-100 text-red-700', colorDark: 'bg-red-600/20 text-red-400' },
  [TicketStatus.IN_PROGRESS]: { label: 'En cours', color: 'bg-orange-100 text-orange-700', colorDark: 'bg-orange-600/20 text-orange-400' },
  [TicketStatus.RESOLVED]: { label: 'Résolu', color: 'bg-green-100 text-green-700', colorDark: 'bg-green-600/20 text-green-400' },
  [TicketStatus.CLOSED]: { label: 'Fermé', color: 'bg-gray-100 text-gray-700', colorDark: 'bg-gray-600/20 text-gray-400' }
};

const priorityConfig = {
  [Priority.LOW]: { label: 'Basse', color: 'text-green-600' },
  [Priority.MEDIUM]: { label: 'Moyenne', color: 'text-blue-600' },
  [Priority.HIGH]: { label: 'Haute', color: 'text-orange-600' },
  [Priority.URGENT]: { label: 'Urgent', color: 'text-red-600' }
};

export function TicketList({ tickets, maxItems }: TicketListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const displayTickets = maxItems ? tickets.slice(0, maxItems) : tickets;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days}j`;
    if (hours > 0) return `Il y a ${hours}h`;
    return 'À l\'instant';
  };

  return (
    <div className={`rounded-xl border overflow-hidden ${
      isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
    }`}>
      <div className={`p-6 border-b ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Tickets récents</h3>
      </div>
      
      <div className={isDark ? 'divide-y divide-[#2a2a2a]' : 'divide-y divide-gray-100'}>
        {displayTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`p-6 transition-colors cursor-pointer ${
              isDark ? 'hover:bg-[#242424]' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>#{ticket.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isDark ? statusConfig[ticket.status].colorDark : statusConfig[ticket.status].color
                  }`}>
                    {statusConfig[ticket.status].label}
                  </span>
                </div>
                
                <h4 className={`font-semibold mb-1 truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {ticket.title}
                </h4>
                
                <p className={`text-sm line-clamp-2 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {ticket.description}
                </p>
                
                <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{ticket.author.login}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                  
                  {ticket.assignedTo && (
                    <div className="flex items-center gap-1">
                      <img
                        src={ticket.assignedTo.avatar}
                        alt={ticket.assignedTo.login || ''}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>Assigné à {ticket.assignedTo.login}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className={`flex items-center gap-1 ${priorityConfig[ticket.priority].color}`}>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{priorityConfig[ticket.priority].label}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {maxItems && tickets.length > maxItems && (
        <div className={`p-4 text-center ${isDark ? 'bg-[#242424]' : 'bg-gray-50'}`}>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Voir tous les tickets ({tickets.length})
          </button>
        </div>
      )}
    </div>
  );
}
