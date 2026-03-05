import {createBrowserRouter} from "react-router-dom";
import Login from '../components/Login';
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import {DashboardLayout} from '../components/DashboardLayout';
import Register from '../components/Register';
import ClientLayout from "../layout/ClientLayout";
import ClientHome from "../views/client_view/pages/ClientHome";
import ClientMyTickets from "../views/client_view/pages/ClientMyTickets";
import ClientSettings from "../views/client_view/pages/ClientSettings";

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
	}
])

