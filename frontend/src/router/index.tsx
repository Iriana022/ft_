import {createBrowserRouter, Navigate} from "react-router-dom";
import Login from '../views/Login_Page/Login';
import {Dashboard} from "../views/view_agent/Dashboard";
import {TicketsPage} from "../views/view_agent/TicketsPage";
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import {DashboardLayout} from '../layout/layout_agent/DashboardLayout';
import Settings from '../components/agent_components/Settings';
import {UserRole} from '../types';
import Register from '../views/Login_Page/Register';
import ClientLayout from "../layout/layout_client/ClientLayout";
import ClientHome from "../views/client_view/ClientHome";
import ClientMyTickets from "../views/client_view/ClientMyTickets";
import ClientSettings from "../views/client_view/ClientSettings";
import Profil from "../components/client_components/Profil";
import ChatTicketView from '../views/chat_ticket/ChatTicketView';
import ChatTicketViewClient from '../views/chat_ticket/ChatTicketViewClient';
import SelectRole from "../views/Login_Page/SelectRole";
import {AdminView, AdminDashboard, AdminTickets, AdminUsers, AdminStats} from "../views/admin_view/AdminView";
import {GoogleCallback} from '../views/Login_Page/GoogleCallback';

export const router = createBrowserRouter([
	{
		path: 'admin',
		element: (
			<ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
				<AdminView />
			</ProtectedRoute>
		),
		children: [
			{
				index: true,
				element: <AdminDashboard />,
			},
			{
				path: 'tickets',
				element: <AdminTickets />,
			},
			{
				path: 'users',
				element: <AdminUsers />,
			},
			{
				path: 'stats',
				element: <AdminStats />,
			},
		],
	},
	{
		path: '/',
		element: <PublicRoute><Login /></PublicRoute>,
	},
	{
		path: 'login',
		element: <PublicRoute><Login /></PublicRoute>
	},
	{
		path: 'register',
		element: <PublicRoute><Register /></PublicRoute>
	},
	{
		path: 'select_role',
		element: <SelectRole />
	},
	{
		path: 'auth/callback',
		element: <GoogleCallback />
	},
	{
		path: 'agent',
		element: (
			<ProtectedRoute allowedRoles={[UserRole.AGENT, UserRole.ADMIN]}>
				<DashboardLayout />
			</ProtectedRoute >
		),
		children: [
			{
				index: true,
				element: <Navigate to="dashboard" replace />,
			},
			{
				path: 'dashboard',
				element: <Dashboard />,
			},
			{
				path: 'tickets',
				element: <TicketsPage />,
			},
			{
				path: 'notifications',
				element: <div>Notifications — coming soon</div>,
			},
			{
				path: 'settings',
				element: <Settings />,
			},
		]
	},
	{
		path: 'client',
		element: (
			// TODO: put ClientLayout inside the ProtectedRoute component
			<ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
				<ClientLayout />
			</ProtectedRoute >
		),
		children: [
			{
				path: '',
				element: <ClientHome />
			},
			{
				path: 'my_tickets',
				element: <ClientMyTickets />
			},
			{
				path: 'settings',
				element: <ClientSettings />
			}
		]
	},
	{
		path: 'client/profil',
		element: (
			<ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
				<Profil />
			</ProtectedRoute>
		)
	},
	{
		path: 'chat_ticket_client',
		element: (
			<ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
				<ChatTicketViewClient />
			</ProtectedRoute>
		)
	},
	{
		path: 'chat_ticket',
		element: (
			<ProtectedRoute allowedRoles={[UserRole.AGENT, UserRole.ADMIN]}>
				<ChatTicketView />
			</ProtectedRoute>
		)
	}
])

