import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/agent_components/Sidebar';
import { UserRole } from '../../types';
import { getStoredUserRole } from '../../services/auth';

export function DashboardLayout() {
  const currentRole = getStoredUserRole() ?? UserRole.AGENT;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentRole={currentRole} />
      <Outlet />
    </div>
  );
}