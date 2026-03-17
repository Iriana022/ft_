import {createBrowserRouter} from "react-router-dom";
import Login from '../views/Login_Page/Login';
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import {DashboardLayout} from '../layout/layout_agent/DashboardLayout';
import Register from '../views/Login_Page/Register';
import ClientLayout from "../layout/layout_client/ClientLayout";
import ClientHome from "../views/client_view/pages/ClientHome";
import ClientMyTickets from "../views/client_view/pages/ClientMyTickets";
import ClientSettings from "../views/client_view/pages/ClientSettings";
import Profil from "../components/client_components/Profil";
import ChatTicketView from '../views/chat_ticket/ChatTicketView';
import ChatTicketViewClient from '../views/chat_ticket/ChatTicketViewClient';

export const router = createBrowserRouter([
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
			<ProtectedRoute>
				<DashboardLayout />
			</ProtectedRoute >
		),
	},
	{
		path: 'client_view',
		element: <ClientLayout />,
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
		element: <Profil />
	},
	{
		path: 'client_view/ticket_message',
		element: <ChatTicketViewClient />
	},
	{
		path: 'chat_ticket_client',
		element: <ChatTicketViewClient />
	},
	{
		path: 'chat_ticket',
		element: (
			<ProtectedRoute>
				<ChatTicketView />
			</ProtectedRoute>
		)
	}
])

