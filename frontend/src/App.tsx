import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Login from './components/Login.tsx'
import SignUp from './components/SignUp.tsx'

const router = createBrowserRouter([
	{
		path: '/',
		element: <Login/>
	},
	{
		path: '/signup',
		element: <SignUp/>
	}
])

function App() {
  return <RouterProvider router={router} />
 
}

export default App
