import NavItem from './NavItem';
import {HomeIcon} from '@heroicons/react/24/outline';
import {TicketIcon} from '@heroicons/react/24/outline';
import {Cog8ToothIcon} from '@heroicons/react/24/outline';
import Avatar from './Avatar';
import avatar1 from '../../assets/avatars/avatar1.jpg';

function MobileMenu() {
	return (
		<div className="flex mt-[50%] justify-center h-full">
			<div className="flex flex-col gap-10 items-center">
				<div className="flex flex-col items-center">
					<Avatar src={avatar1} />
					<h3 className="text-cream font-poppins pt-3">Jennifer Lawrence</h3>
				</div>
				<nav className="flex flex-col gap-4">
					<NavItem icon={HomeIcon} href="/" text="Accueil" color="text-cream" textColor="text-cream" textSize="text-lg" />
					<NavItem icon={TicketIcon} href="/my_tickets" text="Mes Tickets" color="text-cream" textColor="text-cream" textSize="text-lg" />
					<NavItem icon={Cog8ToothIcon} href="/settings" text="Parametres" color="text-cream" textColor="text-cream" textSize="text-lg" />
				</nav>
			</div>
		</div >
	);
}

export default MobileMenu;
