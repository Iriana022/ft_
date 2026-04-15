import { UserIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getHomeRouteByRole, refreshSession } from '../../services/auth';
import { UserRole } from '../../types';
import {useTranslation} from 'react-i18next';

export function SelectRole() {
	const {t} = useTranslation('auth');
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSelectRole = async (role: UserRole.CLIENT | UserRole.AGENT) => {
		try {
			setLoading(true);
			setError('');

			const response = await api.post('/auth/select-role', { role });
			if (response.data?.ok === false) {
				setError(t('selectRoleError'));
				return;
			}

			window.dispatchEvent(new Event('auth-token-updated'));
			const user = await refreshSession(true);
			navigate(getHomeRouteByRole(user?.role ?? role), { replace: true });
		} catch {
			setError(t('selectRoleError'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
				<h1 className="text-2xl font-semibold text-center mb-6">{t('selectRoleTitle')}</h1>
				{error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}
				<div className="flex flex-col gap-4">
					<button type="button" disabled={loading} onClick={() => handleSelectRole(UserRole.CLIENT)} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-100 transition disabled:opacity-50">
						<UserIcon className="w-6 h-6 text-blue-500" />
						<div className="text-left">
							<p className="font-medium">{t('client')}</p>
							<p className="text-sm text-gray-500">{t('clientDescription')}</p>
						</div>
					</button>
					<button type="button" disabled={loading} onClick={() => handleSelectRole(UserRole.AGENT)} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-100 transition disabled:opacity-50">
						<BriefcaseIcon className="w-6 h-6 text-green-500" />
						<div className="text-left">
							<p className="font-medium">{t('agent')}</p>
							<p className="text-sm text-gray-500">{t('agentDescription')}</p>
						</div>
					</button>
				</div>
			</div>
		</div>
	);
}

export default SelectRole;