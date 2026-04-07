import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TicketsPage } from './components/TicketsPage';
import { TicketDetail } from './components/TicketDetail';
import { SettingsPage } from './components/SettingsPage';
import { UserRole, Ticket } from './types';

export default function App() {
  const [activePage, setActivePage] = useState('tickets');
  const [currentRole] = useState<UserRole>(UserRole.AGENT);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          currentRole={currentRole} 
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            setSelectedTicket(null);
          }}
        />
        {selectedTicket ? (
          <TicketDetail 
            ticket={selectedTicket} 
            currentRole={currentRole}
            onBack={handleBackToList}
          />
        ) : (
          <>
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'tickets' && <TicketsPage onTicketClick={handleTicketClick} />}
            {activePage === 'settings' && <SettingsPage currentRole={currentRole} />}
            {/* Les autres pages seront ajoutées ici */}
          </>
        )}
      </div>
    </ThemeProvider>
  );
}