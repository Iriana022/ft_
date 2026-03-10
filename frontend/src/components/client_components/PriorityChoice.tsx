import React from 'react';
import {TicketPriority} from '../../types';

interface PriorityChoiceProps {
	priority: TicketPriority,
}

function PriorityChoice(props: PriorityChoiceProps) {
	let text: string | undefined = undefined;
	let textColor: string | undefined = undefined;
	let bgColor: string | undefined = undefined;

	switch (props.priority) {
		case TicketPriority.LOW: {
			text = "Basse";
			bgColor = "bg-[#E6F4EA]";
			textColor = "text-[#1B5E20]";
		} break;

		case TicketPriority.MEDIUM: {
			text = "Moyenne";
			bgColor = "bg-[#FFF4E5]";
			textColor = "text-[#8A4B00]";
		} break;

		case TicketPriority.HIGH: {
			text = "Haute";
			bgColor = "bg-[#FDECEA]";
			textColor = "text-[#B71C1C]";
		} break;

		case TicketPriority.URGENT: {
			text = "Urgent";
			bgColor = "bg-[#D32F2F]/80";
			textColor = "text-[#FFFFFF]";
		} break;
	}

	return (
		<div className={`w-[150px] ${bgColor} ${textColor} text-xs md:text-sm text-center py-2 md:py-3 rounded-full`}>
			{text}
		</div>
	);
}

export default PriorityChoice;
