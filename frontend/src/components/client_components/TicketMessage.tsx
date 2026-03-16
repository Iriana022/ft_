import React from 'react';
import ContainerComp from '../../layout/layout_client/Container';
import Separator from './Separator';
import {useLocation} from 'react-router-dom';

interface TicketMessageHeaderProps {
	title: string,
}

function TicketMessageHeader(props: TicketMessageHeaderProps) {
	return (
		<ContainerComp>
			<div className="flex items-center">
				<h1>{props.title}</h1>
			</div>
		</ContainerComp>
	);
}

function TicketMessage() {
	const location = useLocation();
	const {state} = location;

	return (
		<>
			<TicketMessageHeader title={state.title} />
		</>
	);
}

export default TicketMessage;
