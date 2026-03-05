import React from 'react';
import {Link} from 'react-router-dom';

interface AvatarProps {
	src: string,
}

function Avatar(props: AvatarProps) {
	return (
		<Link to="/client_view" className="w-12 h-12 border border-2 border-navy/50 focus:border-navy/80 transition hover:border-navy/80 block rounded-full overflow-hidden group">
			<img alt="User avatar" src={props.src} className="w-full h-full object-cover transition hover:scale-108" />
		</Link>
	);
}

export default Avatar;
