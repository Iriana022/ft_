import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import frAuth from '../locales/fr/auth.json';
import enAuth from '../locales/en/auth.json';
import esAuth from '../locales/es/auth.json';

i18n
	.use(initReactI18next)
	.init({
		resources: {
			fr: {auth: frAuth},
			en: {auth: enAuth},
			es: {auth: esAuth},
		},
		lng: localStorage.getItem("lang") || 'fr',
		fallbackLng: 'en',
		ns: ['auth'],
		defaultNS: 'auth', // TODO: change to 'common'
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
