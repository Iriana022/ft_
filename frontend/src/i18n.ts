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

i18n
	.use(initReactI18next)
	.init({
		resources: {
			fr: {
				auth: frAuth,
				nav: frNav,
				client_home: frClientView,
				common: frCommon,
			},
			en: {
				auth: enAuth,
				nav: enNav,
				client_home: enClientView,
				common: enCommon,
			},
			es: {
				auth: esAuth,
				nav: esNav,
				client_home: esClientView,
				common: esCommon,
			},
		},
		lng: localStorage.getItem("lang") || 'fr',
		fallbackLng: 'en',
		ns: ['common', 'auth', "nav", "client_home"],
		defaultNS: 'common',
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
