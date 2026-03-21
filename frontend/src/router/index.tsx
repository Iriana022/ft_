import {createBrowserRouter} from "react-router-dom";
import Login from '../views/Login_Page/Login';
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import {DashboardLayout} from '../layout/layout_agent/DashboardLayout';
import {UserRole} from '../types';
import Register from '../views/Login_Page/Register';
import ClientLayout from "../layout/layout_client/ClientLayout";
import ClientHome from "../views/client_view/pages/ClientHome";
import ClientMyTickets from "../views/client_view/pages/ClientMyTickets";
import ClientSettings from "../views/client_view/pages/ClientSettings";
import Profil from "../components/client_components/Profil";
import ChatTicketView from '../views/chat_ticket/ChatTicketView';
import ChatTicketViewClient from '../views/chat_ticket/ChatTicketViewClient';
import AdminView from "../views/admin_view/AdminView";

export const router = createBrowserRouter([
	{
		path: 'admin',
		element: <AdminView />
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
		path: 'dashboard',
		element: (
			<ProtectedRoute allowedRoles={[UserRole.AGENT, UserRole.ADMIN]}>
				<DashboardLayout />
			</ProtectedRoute >
		),
	},
	{
		path: 'client_view',
		element: (
			<ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
				<ClientLayout />
			</ProtectedRoute>
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
		path: 'client_view/profil',
		element: (
			<ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
				<Profil />
			</ProtectedRoute>
		)
	},
	{
		path: 'client_view/ticket_message',
		element: (
			<ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
				<ChatTicketViewClient />
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

