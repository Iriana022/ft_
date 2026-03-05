import React from 'react';
import {type TicketType} from '../../types';
import TicketStatusIndicator from './TicketStatusIndicator';

function Ticket(props: TicketType) {
	const truncatedTitle =
		props.title.length > 25
			? `${props.title.substring(0, 25)}...`
			: props.title;

	return (
		<div className="relative h-[130px] p-3 bg-blue-100 transition hover:bg-blue-200 rounded-md shadow-md cursor-pointer">
			<h3 className="font-semibold text-base mb-2">{truncatedTitle}</h3>
			<p className="text-sm line-clamp-2">{props.description}</p>
			<div className="absolute right-2 bottom-2">
				<TicketStatusIndicator status={props.status} />
			</div>
		</div>
	);
}

export default Ticket;
