import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import frCommon from '../locales/fr/common.json';
import enCommon from '../locales/en/common.json';
import esCommon from '../locales/es/common.json';
import frAuth from '../locales/fr/auth.json';
import enAuth from '../locales/en/auth.json';
import esAuth from '../locales/es/auth.json';
import frNav from '../locales/fr/nav.json';
import enNav from '../locales/en/nav.json';
import esNav from '../locales/es/nav.json';
import frClientView from '../locales/fr/client_view.json';
import enClientView from '../locales/en/client_view.json';
import esClientView from '../locales/es/client_view.json';
import frTickets from '../locales/fr/tickets.json';
import enTickets from '../locales/en/tickets.json';
import esTickets from '../locales/es/tickets.json';
import frChat from '../locales/fr/chat.json';
import enChat from '../locales/en/chat.json';
import esChat from '../locales/es/chat.json';
import frAgent from '../locales/fr/agent.json';
import enAgent from '../locales/en/agent.json';
import esAgent from '../locales/es/agent.json';
import frProfile from '../locales/fr/profile.json';
import enProfile from '../locales/en/profile.json';
import esProfile from '../locales/es/profile.json';
import frNotifications from '../locales/fr/notifications.json';
import enNotifications from '../locales/en/notifications.json';
import esNotifications from '../locales/es/notifications.json';
import frAdmin from '../locales/fr/admin.json';
import enAdmin from '../locales/en/admin.json';
import esAdmin from '../locales/es/admin.json';
import frLegal from '../locales/fr/legal.json';
import enLegal from '../locales/en/legal.json';
import esLegal from '../locales/es/legal.json';
import {getCookie} from './services/cookies';

i18n
	.use(initReactI18next)
	.init({
		resources: {
			fr: {
				auth: frAuth,
				nav: frNav,
				client_home: frClientView,
				common: frCommon,
				tickets: frTickets,
				chat: frChat,
				agent: frAgent,
				profile: frProfile,
				notifications: frNotifications,
				admin: frAdmin,
				legal: frLegal,
			},
			en: {
				auth: enAuth,
				nav: enNav,
				client_home: enClientView,
				common: enCommon,
				tickets: enTickets,
				chat: enChat,
				agent: enAgent,
				profile: enProfile,
				notifications: enNotifications,
				admin: enAdmin,
				legal: enLegal,
			},
			es: {
				auth: esAuth,
				nav: esNav,
				client_home: esClientView,
				common: esCommon,
				tickets: esTickets,
				chat: esChat,
				agent: esAgent,
				profile: esProfile,
				notifications: esNotifications,
				admin: esAdmin,
				legal: esLegal,
			},
		},
		lng: getCookie('lang') || 'fr',
		fallbackLng: 'en',
		ns: ['common', 'auth', 'nav', 'client_home', 'tickets', 'chat', 'agent', 'profile', 'notifications', 'admin', 'legal'],
		defaultNS: 'common',
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
