import ContainerComp from "../../layout/layout_client/Container";
import Separator from "../../components/client_components/Separator";
import LanguageSelector from "../../components/client_components/LanguageSelector";
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {deleteMyAccount} from "../../services/profile";

function ClientSettings() {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleDeleteAccount = async () => {
		const ok = window.confirm('Supprimer définitivement votre compte ? Cette action est irréversible.');
		if (!ok) return;

		try {
			setIsDeleting(true);
			setError('');
			await deleteMyAccount();

			localStorage.removeItem('access_token');
			localStorage.removeItem('username');
			localStorage.removeItem('user_role');
			localStorage.removeItem('user_avatar');

			navigate('/login');
		} catch (e) {
			console.error('Erreur suppression compte:', e);
			setError('Impossible de supprimer le compte');
		} finally {
			setIsDeleting(false);
		}
	}
	return (
		<div className="min-h-[calc(100vh-300px)]">
			<ContainerComp>
				<h1 className="font-poppins text-navy font-semibold mb-2 mt-10">
					Parametres
				</h1>
				<Separator />
				<div className="flex items-center justify-between py-3">
					<h3 className="text-base">Langage</h3>
					<LanguageSelector />
				</div>
				<Separator />
				<div className="flex items-center justify-between py-3">
					<h3 className="text-base">Compte</h3>
					<button
						onClick={handleDeleteAccount}
						disabled={isDeleting}
						className="text-sm bg-red-300 p-3 rounded transition hover:bg-red-400 cursor-pointer
							disabled:opacity-60">
						{isDeleting ? 'Suppression...' : 'Supprimer mon compte'}
					</button>
					{error && <p className="text-sm text-red-500 mt-2">{error}</p>}
				</div>
			</ContainerComp>
		</div>
	);
}

export default ClientSettings;
