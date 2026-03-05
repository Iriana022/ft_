import React from 'react';
import {tickets} from '../../data';
import {TicketStatus} from '../../types';

interface StatItemProps {
	title: string,
	count: number,
	color: string,
}

function StatItem(props: StatItemProps) {
	let bgColor: string | undefined = undefined;
	let textColor: string | undefined = undefined;
	switch (props.color) {
		case "status-open": {
			bgColor = "bg-status-open/15";
			textColor = "text-status-open";
		} break;
		case "status-in-progress": {
			bgColor = "bg-status-in-progress/15";
			textColor = "text-status-in-progress";
		} break;
		case "status-pending": {
			bgColor = "bg-status-pending/15";
			textColor = "text-status-pending";
		} break;
		case "status-resolved": {
			bgColor = "bg-status-resolved/15";
			textColor = "text-status-resolved";
		} break;
	}

	return (
		<div className={`flex flex-col items-center ${bgColor} p-4 shadow-sm rounded`}>
			<h3>{props.title}</h3>
			<span className={`text-2xl font-semibold ${textColor}`}>{props.count}</span>
		</div>
	);
}

function TicketsStat() {
	const openTicketsCount = tickets.filter(t => t.status === TicketStatus.OPEN).length;
	const inProgressTicketsCount = tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
	const pendingTicketsCount = tickets.filter(t => t.status === TicketStatus.PENDING).length;
	const resolvedTicketsCount = tickets.filter(t => t.status === TicketStatus.RESOLVED).length;

	return (
		<div className="w-full shadow rounded-md p-5">
			<h3 className="font-semibold text-center text-navy text-xl mb-5">
				{tickets.length} Tickets
			</h3>
			<div className="grid grid-cols-2 gap-5">
				<StatItem title="Ouverts" count={openTicketsCount} color="status-open" />
				<StatItem title="En cours" count={inProgressTicketsCount} color="status-in-progress" />
				<StatItem title="En attentes" count={pendingTicketsCount} color="status-pending" />
				<StatItem title="Resolus" count={resolvedTicketsCount} color="status-resolved" />
			</div>
		</div>
	);
}

export default TicketsStat;
