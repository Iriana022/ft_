import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App'
import './i18n';

declare global {
	interface Window {
		__tikeoUnhandledRejectionSilencerInstalled?: boolean;
	}
}

const noop = () => undefined;
console.error = noop;
console.warn = noop;

if (!window.__tikeoUnhandledRejectionSilencerInstalled) {
	window.addEventListener('unhandledrejection', (event) => {
		const reason = event.reason as {
			response?: { status?: number };
			code?: string;
		} | undefined;

		const status = reason?.response?.status;
		if (status === 401 || status === 404 || reason?.code === 'ERR_CANCELED') {
			event.preventDefault();
		}
	});

	window.__tikeoUnhandledRejectionSilencerInstalled = true;
}

createRoot(document.getElementById('root')!).render(
	<App />
)
