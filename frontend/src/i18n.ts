import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import frAuth from '../locales/fr/auth.json';
import enAuth from '../locales/en/auth.json';
import esAuth from '../locales/es/auth.json';
import frNav from '../locales/fr/nav.json';
import enNav from '../locales/en/nav.json';
import esNav from '../locales/es/nav.json';
import frClientHome from '../locales/fr/client_home.json';
import enClientHome from '../locales/en/client_home.json';
import esClientHome from '../locales/es/client_home.json';

i18n
	.use(initReactI18next)
	.init({
		resources: {
			fr: {
				auth: frAuth,
				nav: frNav,
				client_home: frClientHome,
			},
			en: {
				auth: enAuth,
				nav: enNav,
				client_home: enClientHome,
			},
			es: {
				auth: esAuth,
				nav: esNav,
				client_home: esClientHome,
			},
		},
		lng: localStorage.getItem("lang") || 'fr',
		fallbackLng: 'en',
		ns: ['auth', "nav", "client_home"],
		defaultNS: 'auth', // TODO: change to 'common'
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
