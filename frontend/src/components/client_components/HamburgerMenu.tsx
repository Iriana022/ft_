import {useState} from 'react';
import {Bars2Icon} from '@heroicons/react/24/outline';
import {XMarkIcon} from '@heroicons/react/24/outline';

interface HamburgerMenuProps {
	onClick: () => void,
	isMenuOpened: boolean,
}

function HamburgerMenu(props: HamburgerMenuProps) {
	return (
		<div className="block md:hidden z-6969" onClick={props.onClick}>
			{
				!props.isMenuOpened ?
					<Bars2Icon className="w-10 h-10 text-gray-600" /> :
					<XMarkIcon className="w-10 h-10 text-cream fixed" />
			}
		</div>
	);
}

export default HamburgerMenu;
