import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { DashboardLayout } from './components/DashboardLayout'
import { ThemeProvider } from './context/ThemeContext'
import Register from './components/Register'
import ClientView from './views/ClientView';

const router = createBrowserRouter([
    {
        path: '/',
        element: <PublicRoute><Login/></PublicRoute>
    },
    {
        path: '/login',
        element: <PublicRoute><Login/></PublicRoute>
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

function App() {
	return (
		<ThemeProvider>
			<RouterProvider router={router} />
		</ThemeProvider>
	)
}

export default App
