import {useState} from 'react';
import {type TicketType} from '../../types';
import TicketStatusIndicator from './TicketStatusIndicator';
import TicketInformation from './TicketInformation';

interface TicketProps {
	ticket: TicketType,
}

function Ticket(props: TicketProps) {
	const [isOpen, setIsOpen] = useState(false);
	const truncatedTitle =
		props.ticket.title.length > 25
			? `${props.ticket.title.substring(0, 25)}...`
			: props.ticket.title;

	return (
		<>
			{/* Hidden by default */}
			<TicketInformation
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				ticket={props.ticket}
			/>
			<div
				className="relative h-[130px] p-3 bg-blue-100 transition hover:bg-blue-200 rounded-md shadow-md cursor-pointer"
				onClick={() => setIsOpen(true)}
			>
				<h3 className="font-semibold text-base mb-2">{truncatedTitle}</h3>
				<p className="text-sm line-clamp-2">{props.ticket.description}</p>
				<div className="absolute right-2 bottom-2">
					<TicketStatusIndicator status={props.ticket.status} />
				</div>
			</div>
		</>
	);
}

export default Ticket;
