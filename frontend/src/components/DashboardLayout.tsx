import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { TicketsPage } from './TicketsPage';
import { UserRole } from '../types';

export function DashboardLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  const [currentRole] = useState<UserRole>(UserRole.AGENT);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentRole={currentRole} 
        activePage={activePage}
        onNavigate={setActivePage}
      />
      {activePage === 'dashboard' && <Dashboard />}
      {activePage === 'tickets' && <TicketsPage />}
      {/* Les autres pages seront ajoutées ici */}
    </div>
  );
}
