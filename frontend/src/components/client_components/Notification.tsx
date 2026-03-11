import {BellIcon} from '@heroicons/react/24/outline';
import NotificationView from './NotificationView';

function Notification() {
	return (
		<div className="dropdown dropdown-end">
			<div
				tabIndex={0}
				role="button"
				className="
					w-9 h-9
					border border-gray-300
					hover:border-navy/40
					transition
					flex items-center justify-center
					rounded-lg
					bg-cream
					shadow-sm
					hover:shadow-md
					cursor-pointer
				"
			>
				<BellIcon className="w-5 h-5 text-gray-600 transition hover:scale-110" />
			</div>

			<div
				tabIndex={0}
				className="
					dropdown-content
					z-50
					mt-3
					w-80
					bg-cream
					border
					border-gray-400
					rounded-xl
					shadow-lg
					p-2
				"
			>
				<NotificationView />
			</div>
		</div>
	);
}

export default Notification;
