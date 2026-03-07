import React, {useState} from 'react';
import {FunnelIcon} from '@heroicons/react/24/outline';
import {ChevronDownIcon} from '@heroicons/react/24/outline';

interface TicketFilterByStatusElementProps {
	name: string,
	onClick: (e: React.MouseEvent) => void,
}

function TicketFilterByStatusElement(props: TicketFilterByStatusElementProps) {
	return (
		<div className="text-sm py-2 border-b pl-2"
			onClick={props.onClick}
		>
			{props.name}
		</div>
	);
}

function TicketFilterByStatus() {
	const status = ["Tous", "Ouvert", "En cours", "En attente", "Resolu"];
	const [open, setOpen] = useState(false);
	const [currentFilterStatus, setCurrentFilterStatus] = useState('Tous');

	const handleSelect = (e: React.MouseEvent, element: string) => {
		e.stopPropagation();
		setCurrentFilterStatus(element);
		setOpen(false);
	}

	return (
		<div
			className="relative flex items-center gap-2 border py-2 px-3 bg-gray-100 cursor-pointer rounded"
			onClick={() => setOpen(!open)}
		>
			<FunnelIcon className="w-5 h-5 text-gray-500" />
			<span className="text-sm">
				{currentFilterStatus}
			</span>
			<ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
			<div className={`absolute top-full left-0 w-full z-50 border bg-white rounded-b shadow-md
        transition-all duration-200 origin-top
        ${open ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}
			>
				{status.map((element, index) => (
					<TicketFilterByStatusElement
						name={element}
						key={index}
						onClick={(e: React.MouseEvent) => handleSelect(e, element)}
					/>
				))}
			</div>
		</div>
	);
}

export default TicketFilterByStatus;
