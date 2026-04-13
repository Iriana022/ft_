import {Bars2Icon} from '@heroicons/react/24/outline';
import {XMarkIcon} from '@heroicons/react/24/outline';

interface HamburgerMenuProps {
	onClick: () => void,
	isMenuOpened: boolean,
}

function HamburgerMenu(props: HamburgerMenuProps) {
	return (
		<button
			type="button"
			className="block md:hidden z-50 p-2 -ml-2 transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-navy/50 rounded-lg"
			onClick={props.onClick}
			aria-label={props.isMenuOpened ? 'Close menu' : 'Open menu'}
		>
			{
				!props.isMenuOpened ?
					<Bars2Icon className="w-8 h-8 text-navy" /> :
					<XMarkIcon className="w-8 h-8 text-navy animate-pulse-once" />
			}
		</button>
	);
}

export default HamburgerMenu;
