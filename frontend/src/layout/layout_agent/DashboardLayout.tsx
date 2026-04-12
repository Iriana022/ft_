import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/agent_components/Sidebar';
import { UserRole } from '../../types';
import { getStoredUserRole } from '../../services/auth';
import Footer from '../Footer';

export function DashboardLayout() {
  const currentRole = getStoredUserRole() ?? UserRole.AGENT;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentRole={currentRole} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex flex-1 min-h-0 flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
