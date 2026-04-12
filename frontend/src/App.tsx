import { RouterProvider } from 'react-router-dom'
import { router } from './router';
import { useEffect } from 'react';
import { getSocket } from './services/singleton';

function SocketBootstrap({ children }: { children: React.ReactNode }) {

	useEffect(() => {
		const socket = getSocket();

		const registerRoleChannel = () => {
			const token = localStorage.getItem('access_token');
			if (!token)
				return;
			socket.emit('registerRoleChannel', { token });
		};

		const onConnect = () => {
			console.info('[socket] connected', socket.id);
			registerRoleChannel();
		};

		const onAuthTokenUpdated = () => {
			registerRoleChannel();
		};
		const onDisconnect = (reason: string) => console.warn('[socket] disconnected:', reason);
		const onConnectError = (err: Error) => console.error('[socket] connect_error:', err.message);
		const onReconnect = (attempt: number) => console.info('[socket] reconnected after', attempt, 'attemp(s)');

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('connect_error', onConnectError);
		socket.io.on('reconnect', onReconnect);
		window.addEventListener('auth-token-updated', onAuthTokenUpdated);

		if (!socket.connected)
			socket.connect();
		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('connect_error', onConnectError);
			socket.io.off('reconnect', onReconnect);
			window.removeEventListener('auth-token-updated', onAuthTokenUpdated);
		};
	}, []);

	return <>{children}</>;
}

function App() {
	return (
		<SocketBootstrap>
			<RouterProvider router={router} />
		</SocketBootstrap>
	)
}

export default App;
