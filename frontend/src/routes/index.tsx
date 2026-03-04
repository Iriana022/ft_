import {createBrowserRouter} from "react-router-dom";
import Login from '../components/Login';
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import {DashboardLayout} from '../components/DashboardLayout';
import Register from '../components/Register';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <PublicRoute><Login /></PublicRoute>
	},
	{
		path: '/login',
		element: <PublicRoute><Login /></PublicRoute>
	},
	{
		path: '/register',
		element: <PublicRoute><Register /></PublicRoute>
	},
	{
		path: '/dashboard',
		element: (
			<ProtectedRoute>
				<DashboardLayout />
			</ProtectedRoute>
		)
	}
])

