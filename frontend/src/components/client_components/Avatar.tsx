import React from 'react';

interface AvatarProps {
	src: string,
	size: number,
}

function Avatar(props: AvatarProps) {
	const width: string = "w-" + props.size.toString();
	const height: string = "h-" + props.size.toString();

	return (
		<div className={`${width} ${height} border border-2 border-navy/50 focus:border-navy/80 transition hover:border-navy/80 block rounded-full overflow-hidden group`}>
			<img alt="User avatar" src={props.src} className="w-full h-full object-cover transition hover:scale-108" />
		</div>
	);
}

export default Avatar;
