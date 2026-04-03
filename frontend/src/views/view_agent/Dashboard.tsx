import { Ticket, AlertCircle, Clock, PauseCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '../../components/agent_components/StatCard';
import { TicketList } from './TicketList';
import { ThemeToggle } from '../../components/agent_components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { TicketStatus, UserRole, type Ticket as TicketType } from '../../types';
import { fetchTickets, getTicketStats } from '../../services/tickets';
import { io } from 'socket.io-client';

export function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [notification, setNotification] = useState<String | null>();

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await fetchTickets();

        const clientTickets = data.filter(
          (ticket) => ticket.author.role === UserRole.CLIENT
        );

        const sortedTickets = [...clientTickets].sort((a, b) => {
          const aClosed = a.status === TicketStatus.CLOSED;
          const bClosed = b.status === TicketStatus.CLOSED;

          if (aClosed !== bClosed) {
            return aClosed ? 1 : -1; // CLOSED en bas
          }

          return b.createdAt.getTime() - a.createdAt.getTime(); // plus récent en haut
        });

        setTickets(sortedTickets);
      } catch (error) {
        console.error('Erreur chargement tickets:', error);
      }
    };

    loadTickets();

		const socket = io('/', {
			path: '/socket.io',
			transports: ['websocket'],
			withCredentials: true
		});
    socket.on('newTicket', (ticket: TicketType) => {
      console.log('New ticket received :', ticket);
      if (ticket.author.role === UserRole.CLIENT) {
        setTickets((prev) => [ticket, ...prev]);
        setNotification(`New ticket incoming : ${ticket.title}`);
        setTimeout(() => setNotification(), 5000);
      }
    });

    socket.on('ticketUnreadUpdated', (payload: { ticketId: number; agentUnreadCount: number; clientUnreadCount: number }) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === payload.ticketId
            ? {
              ...t,
              agentUnreadCount: payload.agentUnreadCount,
              clientUnreadCount: payload.clientUnreadCount,
            }
            : t
        )
      );
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const stats = useMemo(() => getTicketStats(tickets), [tickets]);

  return (
    <div className={`flex-1 overflow-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Notification popup */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border transition-all ${isDark
          ? 'bg-[#1a1a1a] border-indigo-500 text-gray-100'
          : 'bg-white border-indigo-500 text-gray-900'
          }`}>
          <AlertCircle className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-medium">{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className={`ml-2 text-xs ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✕
          </button>
        </div>
      )}
      {/* Header */}
      <div className={`border-b px-8 py-6 ${isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-gray-200'
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
            title="En attente"
            value={stats.pending}
            icon={PauseCircle}
            color="purple"
          />
          <StatCard
            title="En cours"
            value={stats.inProgress}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Recent Tickets */}
        <TicketList tickets={tickets} maxItems={4} />
      </div>
    </div>
  );
}
