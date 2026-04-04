import React, {useState} from 'react';
import {FunnelIcon} from '@heroicons/react/24/outline';
import {ChevronDownIcon} from '@heroicons/react/24/outline';
import {TicketStatus, TicketPriority} from '../../types';

interface TicketFilterElementProps {
	name: string,
	onClick: (e: React.MouseEvent) => void,
}

function TicketFilterElement(props: TicketFilterElementProps) {
	return (
		<div className="text-sm py-2 border-b pl-2"
			onClick={props.onClick}
		>
			{props.name}
		</div>
	);
}

interface StatusFilter {
	label: string,
	value: TicketStatus | null,
}

interface PriorityFilter {
	label: string,
	value: TicketPriority | null,
}

interface TicketFilterProps {
	list: {label: string, value: TicketStatus | TicketPriority | null}[],
	currentFilterElement: string,
	handleSelect: (e: React.MouseEvent, element: StatusFilter | PriorityFilter) => void;
}

function TicketFilter(props: TicketFilterProps) {
	const [open, setOpen] = useState(false);

	return (
		<div
			className="relative flex items-center justify-between w-[150px] gap-2 border py-2 px-3 bg-gray-100 cursor-pointer rounded"
			onClick={() => setOpen(!open)}
		>
			<div className="flex items-center gap-2">
				<FunnelIcon className="w-5 h-5 text-gray-500" />
				<span className="text-sm">
					{props.currentFilterElement}
				</span>
			</div>
			<ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
			<div className={`absolute top-full left-0 w-full z-50 border bg-white rounded-b shadow-md
        transition-all duration-200 origin-top
        ${open ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}
			>
				{props.list.map((element, index) => (
					<TicketFilterElement
						name={element.label}
						key={index}
						onClick={(e: React.MouseEvent) => {
							props.handleSelect(e, element);
							setOpen(false);
						}
						}
					/>
				))}
			</div>
		</div>
	);
}

export default TicketFilter;
