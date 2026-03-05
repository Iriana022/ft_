import React from 'react';
import {TicketStatus} from '../../types';

interface TicketStatusIndicatorProps {
	status: TicketStatus,
}

function TicketStatusIndicator(props: TicketStatusIndicatorProps) {
	let color: string | undefined = undefined;
	let text: string | undefined = undefined;

	switch (props.status) {
		case TicketStatus.OPEN: {
			color = 'bg-status-open';
			text = 'Ouvert';
		} break;
		case TicketStatus.IN_PROGRESS: {
			color = 'bg-status-in-progress';
			text = 'En cours';
		} break;
		case TicketStatus.PENDING: {
			color = 'bg-status-pending';
			text = 'En attente';
		} break;
		case TicketStatus.RESOLVED: {
			color = 'bg-status-resolved';
			text = 'Resolu';
		} break;
		default:
			new Error("Unreachable");
	}

	return (
		<div className="flex items-center gap-1">
			<div className={`w-3 h-3 rounded-full ${color}`}>
			</div>
			<span className="text-sm">
				{text}
			</span>
		</div >
	);
}

export default TicketStatusIndicator;
