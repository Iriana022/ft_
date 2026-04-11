import React from 'react';
import {useTranslation} from 'react-i18next';

export default function SignUp() {
	const {t} = useTranslation('auth');

	return (
		<div className="flex justify-center items-center h-screen">
			<fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
				<legend className="fieldset-legend">{t('register')}</legend>

				<label className="label">{t('email')}</label>
				<input type="email" className="input" placeholder={t('emailPlaceholder')} />

				<label className="label">{t('password')}</label>
				<input type="password" className="input" placeholder={t('passwordPlaceholder')} />

				<button className="btn btn-neutral mt-4">{t('login')}</button>
			</fieldset>
		</div>
	);
}
