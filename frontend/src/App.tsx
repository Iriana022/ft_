import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import DashboardHome from './components/DashboardHome'
import Settings from './components/Settings'
import { ThemeProvider } from './context/ThemeContext'
import Register from './components/Register'


const router = createBrowserRouter([
    {
        path: '/login',
        element: <PublicRoute><Login/></PublicRoute>
    },
    {
        path: '/register',
        element: <PublicRoute><Register /></PublicRoute>
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: '',
                element: <DashboardHome />
            },
            {
                path: 'dashboard',
                element: <DashboardHome />
            },
            {
                path: 'profile', 
                element: <Profile />
            },
            {
                path: 'settings',
                element : <Settings />
            }
        ]
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
