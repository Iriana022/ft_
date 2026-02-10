import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Login from './components/Login.tsx'
import SignUp from './components/SignUp.tsx'
import Register from './components/Register.tsx'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import DashboardHome from './components/DashboardHome'


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
        path: '/signup',
        element: <PublicRoute><SignUp/></PublicRoute>
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
                path: 'dashboard',
                element: <DashboardHome />
            },
            {
                path: 'profile', 
                element: <Profile />
            }
        ]
    }
])

function App() {
  return <RouterProvider router={router} />
 
}

export default App
