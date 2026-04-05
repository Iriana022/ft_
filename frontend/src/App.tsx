import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { router } from './router';
import { useEffect } from 'react';
import { getSocket } from './services/singleton';

function SocketBootstrap({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const socket = getSocket();

		const onConnect = () => console.info('[socket] connected', socket.id);
		const onDisconnect = (reason: string) => console.warn('[socket] disconnected:', reason);
		const onConnectError = (err: Error) => console.error('[socket] connect_error:', err.message);
		const onReconnect = (attempt: number) => console.info('[socket] reconnected after', attempt, 'attemp(s)');

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('connect_error', onConnectError);
		socket.io.on('reconnect', onReconnect);

		if (!socket.connected)
			socket.connect();

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('connect_error', onConnectError);
			socket.io.off('reconnect', onReconnect);
		};
	}, []);

	return <>{children}</>;
}

function App() {
	return (
		<ThemeProvider>
			<SocketBootstrap>
				<RouterProvider router={router} />
			</SocketBootstrap>
		</ThemeProvider>
	)
}

export default App
