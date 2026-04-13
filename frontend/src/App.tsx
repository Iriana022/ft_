import {RouterProvider} from 'react-router-dom'
import {router} from './router';
import {useEffect} from 'react';
import {getSocket} from './services/singleton';

function SocketBootstrap({children}: {children: React.ReactNode}) {

	useEffect(() => {
		const socket = getSocket();

		const registerRoleChannel = () => {
			const token = localStorage.getItem('access_token');
			if (!token)
				return;
			socket.emit('registerRoleChannel', {token});
		};

		const onConnect = () => {
			registerRoleChannel();
		};

		const onAuthTokenUpdated = () => {
			const token = localStorage.getItem('access_token');
			if (!token) {
				if (socket.connected) {
					socket.disconnect();
				}
				return;
			}

			if (!socket.connected) {
				socket.connect();
				return;
			}

			registerRoleChannel();
		};

		const onAccountDeleted = (payload?: { userId?: number }) => {
			localStorage.removeItem('access_token');
			localStorage.removeItem('username');
			localStorage.removeItem('user_role');
			localStorage.removeItem('user_avatar');
			window.dispatchEvent(new Event('auth-token-updated'));
			window.location.replace('/login');
		};
		const onConnectError = (err: Error) => console.error('[socket] connect_error:', err.message);

		socket.on('connect', onConnect);
		socket.on('connect_error', onConnectError);
		socket.on('accountDeleted', onAccountDeleted);
		window.addEventListener('auth-token-updated', onAuthTokenUpdated);

		if (!socket.connected && !!localStorage.getItem('access_token'))
			socket.connect();
		return () => {
			socket.off('connect', onConnect);
			socket.off('connect_error', onConnectError);
			socket.off('accountDeleted', onAccountDeleted);
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
