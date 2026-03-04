import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import './App.css'
import {ThemeProvider} from './context/ThemeContext'
import {router} from './routes';

function App() {
	return (
		<ThemeProvider>
			<RouterProvider router={router} />
		</ThemeProvider>
	)
}

export default App
