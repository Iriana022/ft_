import NavItem from './NavItem';
import {HomeIcon} from '@heroicons/react/24/outline';
import {TicketIcon} from '@heroicons/react/24/outline';
import {Cog8ToothIcon} from '@heroicons/react/24/outline';
import Avatar from './Avatar';
import {useNavigate} from 'react-router-dom';

const avatar1 = '/assets/avatars/avatar1.jpg';

function MobileMenu() {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('username');
		localStorage.removeItem('user_role');
		navigate('/login');
	};

	return (
		<div className="flex mt-[50%] justify-center h-full">
			<div className="flex flex-col gap-10 items-center">
				<div className="flex flex-col items-center">
					<Avatar src={avatar1} size="xl" />
					<h3 className="text-cream font-poppins pt-3">Jennifer Lawrence</h3>
				</div>
				<nav className="flex flex-col gap-4">
					<NavItem icon={HomeIcon} href="/client" text="Accueil" color="text-cream" textColor="text-cream" textSize="text-lg" />
					<NavItem icon={TicketIcon} href="/client/my_tickets" text="Mes Tickets" color="text-cream" textColor="text-cream" textSize="text-lg" />
					<NavItem icon={Cog8ToothIcon} href="/client/settings" text="Parametres" color="text-cream" textColor="text-cream" textSize="text-lg" />
					<button
						onClick={handleLogout}
						className="text-cream text-lg font-poppins text-left"
					>
						Déconnexion
					</button>
				</nav>
			</div>
		</div>
	);
}

export default MobileMenu;
