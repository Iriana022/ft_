import {Link} from 'react-router-dom';

interface TikeoLogoProps {
	href: string,
	color: string,
	size: string,
}

function TikeoLogo(props: TikeoLogoProps) {
	return (
		<Link to={props.href} className={`font-inter ${props.size} ${props.color} font-bold`}>
			Tikeo
		</Link >
	);
}

export default TikeoLogo;
