import {useState} from 'react';
import Separator from '../components/login_components/Separator';
import TikeoLogo from '../components/client_components/TikeoLogo';
import NavItem from '../components/client_components/NavItem';
import {HomeIcon} from '@heroicons/react/24/outline';
import {TicketIcon} from '@heroicons/react/24/outline';
import {Cog8ToothIcon} from '@heroicons/react/24/outline';
import HamburgerMenu from '../components/client_components/HamburgerMenu';
import Notification from '../components/client_components/Notification';
import Avatar from '../components/client_components/Avatar';
import avatar1 from '../assets/avatars/avatar1.jpg';
import ContainerComp from './layout_client/Container';
import MobileMenu from '../components/client_components/MobileMenu';
import {Link} from 'react-router-dom';

function Header() {
	const [isMenuOpened, setIsMenuOpened] = useState(false);

	return (
		<>
			<ContainerComp>
				<header className="pt-10 flex justify-between">
					{/* TODO: add transition later */}
					<div
						className={`fixed top-0 md:hidden w-screen h-full bg-dark z-69 ${isMenuOpened ? "left-0" : "-left-full"
							}`}
					>
						<MobileMenu />
					</div>
					<div className="flex gap-[100px]">
						<HamburgerMenu onClick={() => setIsMenuOpened(s => !s)} isMenuOpened={isMenuOpened} />
						<div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
							<TikeoLogo href="/client_view" />
						</div>
						<nav className="hidden md:flex gap-5">
							<NavItem icon={HomeIcon} href="/client_view" text="Acceuil" color="text-gray-500" />
							<NavItem icon={TicketIcon} href="/client_view/my_tickets" text="Mes Tickets" color="text-gray-600" />
							<NavItem icon={Cog8ToothIcon} href="/client_view/settings" text="Parametres" color="text-gray-600" />
						</nav>
					</div>
					<div className="flex items-center gap-8">
						<Notification />
						<Link to='profil' className="hidden md:block">
							<Avatar src={avatar1} size={12} />
						</Link>
					</div>
				</header>
			</ContainerComp >
			<Separator />
		</>
	);
}

export default Header;
