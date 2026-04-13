import ContainerComp from "../../layout/layout_client/Container";
import Separator from "../../components/client_components/Separator";
import LanguageSelector from "../../components/client_components/LanguageSelector";
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {deleteMyAccount} from "../../services/profile";
import ConfirmModal from "../../components/client_components/ConfirmModal";
import {useTranslation} from 'react-i18next';

function ClientSettings() {
	const {t} = useTranslation('profile');
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState('');
	const [openModal, setOpenModal] = useState(false);
	const navigate = useNavigate();

	const handleDeleteAccount = async () => {
		try {
			setIsDeleting(true);
			setError('');
			await deleteMyAccount();

			localStorage.removeItem('access_token');
			localStorage.removeItem('username');
			localStorage.removeItem('user_role');
			localStorage.removeItem('user_avatar');
			window.dispatchEvent(new Event('auth-token-updated'));

			navigate('/login');
		} catch (e) {
			console.error('Erreur suppression compte:', e);
			setError(t('deleteAccountError'));
		} finally {
			setIsDeleting(false);
			setOpenModal(false);
		}
	}
	return (
		<div className="min-h-[calc(100vh-300px)]">
			<ContainerComp>
				<h1 className="font-poppins text-navy font-semibold mb-2 mt-10">
					{t('clientSettingsTitle')}
				</h1>
				<Separator />
				<div className="flex items-center justify-between py-3">
					<h3 className="text-base">{t('clientLanguageLabel')}</h3>
					<LanguageSelector />
				</div>
				<Separator />
				<div className="flex items-center justify-between py-3">
					<h3 className="text-base">{t('clientAccountLabel')}</h3>
					<button
						onClick={() => setOpenModal(true)}
						disabled={isDeleting}
						className="text-sm bg-red-300 p-3 rounded transition hover:bg-red-400 cursor-pointer
							disabled:opacity-60">
						{isDeleting ? t('deleting') : t('deleteAccount')}
					</button>
					{error && <p className="text-sm text-red-500 mt-2">{error}</p>}
				</div>
			</ContainerComp>
			<ConfirmModal
				isOpen={openModal}
				onClose={() => setOpenModal(false)}
				onConfirm={handleDeleteAccount}
				loading={isDeleting}
			/>
		</div>
	);
}

export default ClientSettings;
