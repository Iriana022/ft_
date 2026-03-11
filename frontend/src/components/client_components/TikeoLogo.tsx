import React from 'react';
import {Link} from 'react-router-dom';

interface TikeoLogoProps {
	href: string,
}

function TikeoLogo(props: TikeoLogoProps) {
	return (
		<Link to={props.href} className="font-inter text-4xl text-navy font-bold">
			Tikeo
		</Link>
	);
}

export default TikeoLogo;
