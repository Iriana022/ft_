import React from 'react';
import {NavLink} from 'react-router-dom';
import {type HeroIconType} from '../../types';

interface NavItemProps {
	icon: HeroIconType,
	href: string,
	text: string,
	color: string,
	textColor?: string,
	textSize?: string
}

function NavItem({icon: Icon, href, text, color, textColor, textSize}: NavItemProps) {
	return (
		<NavLink to={href} className="flex items-center gap-2 group">
			<Icon className={`w-5 h-5 ${color} ${textSize ? textSize : "text-sm"} transition group-hover:text-navy`} />
			<span className={`font-poppins ${textSize ? textSize : "text-sm"} ${textColor ? textColor : ''} transition group-hover:text-navy`}>
				{text}
			</span>
		</NavLink >
	);
}

export default NavItem;
