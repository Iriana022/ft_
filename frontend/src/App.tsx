import {RouterProvider} from 'react-router-dom'
import {router} from './router';
import {useEffect} from 'react';
import {getSocket} from './services/singleton';
import api from './services/api';
import {clearAuthStorage} from './services/auth';

function SocketBootstrap({children}: {children: React.ReactNode}) {

	useEffect(() => {
		const socket = getSocket();
		let sessionCheckIntervalId: number | null = null;

		const redirectToLoginIfSignedOut = () => {
			if (localStorage.getItem('access_token')) {
				return;
			}

			if (window.location.pathname !== '/login') {
				window.location.replace('/login');
			}
		};

		const verifySessionAgainstServer = async () => {
			if (!localStorage.getItem('access_token')) {
				return;
			}

			try {
				await api.get('auth/me');
			} catch {
			}
		};

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
				redirectToLoginIfSignedOut();
				return;
			}

			if (!socket.connected) {
				socket.connect();
				return;
			}

			registerRoleChannel();
		};

		const onAccountDeleted = () => {
			clearAuthStorage();
			redirectToLoginIfSignedOut();
		};

		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				void verifySessionAgainstServer();
			}
		};
		const onConnectError = (err: Error) => console.error('[socket] connect_error:', err.message);

		socket.on('connect', onConnect);
		socket.on('connect_error', onConnectError);
		socket.on('accountDeleted', onAccountDeleted);
		window.addEventListener('auth-token-updated', onAuthTokenUpdated);
		document.addEventListener('visibilitychange', onVisibilityChange);

		sessionCheckIntervalId = window.setInterval(() => {
			void verifySessionAgainstServer();
		}, 15000);

		if (!socket.connected && !!localStorage.getItem('access_token'))
			socket.connect();
		void verifySessionAgainstServer();
		return () => {
			socket.off('connect', onConnect);
			socket.off('connect_error', onConnectError);
			socket.off('accountDeleted', onAccountDeleted);
			window.removeEventListener('auth-token-updated', onAuthTokenUpdated);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			if (sessionCheckIntervalId !== null) {
				window.clearInterval(sessionCheckIntervalId);
			}
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
