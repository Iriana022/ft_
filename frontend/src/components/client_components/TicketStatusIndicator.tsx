import {TicketStatus} from '../../types';
import {useTranslation} from 'react-i18next';

interface TicketStatusIndicatorProps {
	status: TicketStatus,
}

function TicketStatusIndicator(props: TicketStatusIndicatorProps) {
	let color: string | undefined = undefined;
	let text: string | undefined = undefined;

	const {t: tc} = useTranslation();

	switch (props.status) {
		case TicketStatus.OPEN: {
			color = 'bg-status-open';
			text = tc("open");
		} break;
		case TicketStatus.IN_PROGRESS: {
			color = 'bg-status-in-progress';
			text = tc("inProgress");
		} break;
		case TicketStatus.RESOLVED: {
			color = 'bg-status-resolved';
			text = tc("resolved");
		} break;
		case TicketStatus.CLOSED: {
			color = 'bg-status-closed';
			text = tc("closed");
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
		</div>
	);
}

export default TicketStatusIndicator;
