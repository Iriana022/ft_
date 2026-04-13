import {HomeIcon} from '@heroicons/react/24/outline';
import {TicketIcon} from '@heroicons/react/24/outline';
import {Cog8ToothIcon} from '@heroicons/react/24/outline';
import Avatar from './Avatar';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

const avatar1 = '/assets/avatars/avatar1.jpg';

interface MobileMenuProps {
	onClose?: () => void;
}

function MobileMenu({onClose}: MobileMenuProps) {
	const navigate = useNavigate();
	const {t} = useTranslation('nav');
	const {t: tc} = useTranslation('common');
	const username = localStorage.getItem('username') || 'User';

	const handleNavigate = (path: string) => {
		navigate(path);
		onClose?.();
	};

	const handleLogout = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('username');
		localStorage.removeItem('user_role');
		window.dispatchEvent(new Event('auth-token-updated'));
		navigate('/login');
		onClose?.();
	};

	return (
		<div className="flex flex-col items-center justify-center h-full px-8">
			<div className="flex flex-col items-center gap-8 w-full max-w-xs">
				<div className="flex flex-col items-center">
					<Avatar src={avatar1} size="xl" />
					<h3 className="text-cream font-poppins pt-3 text-lg">{username}</h3>
				</div>
				<nav className="flex flex-col gap-4 w-full">
					<button
						onClick={() => handleNavigate('/client')}
						className="flex items-center gap-3 px-4 py-3 text-cream text-lg font-poppins rounded-lg transition-all duration-200 hover:bg-white/10"
					>
						<HomeIcon className="w-6 h-6" />
						<span>{t('home')}</span>
					</button>
					<button
						onClick={() => handleNavigate('/client/my_tickets')}
						className="flex items-center gap-3 px-4 py-3 text-cream text-lg font-poppins rounded-lg transition-all duration-200 hover:bg-white/10"
					>
						<TicketIcon className="w-6 h-6" />
						<span>{t('myTickets')}</span>
					</button>
					<button
						onClick={() => handleNavigate('/client/settings')}
						className="flex items-center gap-3 px-4 py-3 text-cream text-lg font-poppins rounded-lg transition-all duration-200 hover:bg-white/10"
					>
						<Cog8ToothIcon className="w-6 h-6" />
						<span>{t('settings')}</span>
					</button>
					<button
						onClick={handleLogout}
						className="flex items-center gap-3 px-4 py-3 text-cream text-lg font-poppins rounded-lg transition-all duration-200 hover:bg-red-500/20 text-left mt-4"
					>
						<span>{tc('logout')}</span>
					</button>
				</nav>
			</div>
		</div>
	);
}

export default MobileMenu;
