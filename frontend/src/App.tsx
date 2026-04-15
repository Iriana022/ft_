import {RouterProvider} from 'react-router-dom'
import {router} from './router';
import {useEffect} from 'react';
import {getSocket} from './services/singleton';
import {clearAuthStorage, refreshSession} from './services/auth';

function SocketBootstrap({children}: {children: React.ReactNode}) {

	useEffect(() => {
		const socket = getSocket();
		let sessionCheckIntervalId: number | null = null;
		const publicPaths = new Set(['/login', '/register', '/auth/callback', '/']);

		const redirectToLoginIfSignedOut = () => {
			if (publicPaths.has(window.location.pathname)) {
				return;
			}

			if (window.location.pathname !== '/login') {
				window.location.replace('/login');
			}
		};

		const registerRoleChannel = () => {
			socket.emit('registerRoleChannel', {});
		};

		const syncSocketWithSession = async () => {
			const user = await refreshSession(true);

			if (!user) {
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

		const onConnect = () => {
			registerRoleChannel();
		};

		const onAuthTokenUpdated = () => {
			void syncSocketWithSession();
		};

		const onAccountDeleted = () => {
			clearAuthStorage();
			redirectToLoginIfSignedOut();
		};

		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				void syncSocketWithSession();
			}
		};
		const onConnectError = (err: Error) => console.error('[socket] connect_error:', err.message);

		socket.on('connect', onConnect);
		socket.on('connect_error', onConnectError);
		socket.on('accountDeleted', onAccountDeleted);
		window.addEventListener('auth-token-updated', onAuthTokenUpdated);
		document.addEventListener('visibilitychange', onVisibilityChange);

		sessionCheckIntervalId = window.setInterval(() => {
			void syncSocketWithSession();
		}, 15000);

		void syncSocketWithSession();
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
