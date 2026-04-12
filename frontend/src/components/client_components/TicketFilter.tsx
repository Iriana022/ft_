import {useState, useEffect, useRef} from 'react';
import {FunnelIcon} from '@heroicons/react/24/outline';
import {ChevronDownIcon} from '@heroicons/react/24/outline';
import {TicketStatus, TicketPriority} from '../../types';

interface TicketFilterElementProps {
	name: string,
	onClick: (e: React.MouseEvent) => void,
}

function TicketFilterElement(props: TicketFilterElementProps) {
	return (
		<div
			className="px-3 py-2 text-sm text-dark cursor-pointer
		hover:bg-light-blue/30 hover:text-navy
		transition-colors duration-150"
			onClick={props.onClick}
		>
			{props.name}
		</div>
	);
}

export type TicketFilterOption = {
	label: string,
	value: TicketStatus | TicketPriority | null;
}

interface TicketFilterProps {
	label: string,
	list: TicketFilterOption[];
	currentFilterElement: string,
	handleSelect: (e: React.MouseEvent, element: StatusFilter | PriorityFilter) => void;
}

function TicketFilter(props: TicketFilterProps) {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		}
	}, []);

	return (
		<div ref={dropdownRef} className="flex items-center gap-2">
			<span className="text-xs md:text-sm">{props.label}: </span>
			<div
				className="relative flex items-center justify-between w-[100px] md:w-[150px]
				gap-2 border border-navy/20 py-2 px-3
				bg-cream text-navy rounded-lg
				cursor-pointer shadow-sm
				hover:border-sky transition"
				onClick={() => setOpen(!open)}
			>
				<div className="flex items-center gap-2">
					<FunnelIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
					<span className="text-xs md:text-sm">
						{props.currentFilterElement}
					</span>
				</div>
				<ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
				<div
					className={`absolute top-full left-0 w-full mt-2 z-50 rounded-lg shadow-lg
					bg-cream border border-navy/10 overflow-hidden
					transition-all duration-200 origin-top
					${open ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}
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
		</div>
	);
}

export default TicketFilter;
