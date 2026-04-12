import { BellIcon } from '@heroicons/react/24/outline';
import NotificationView, { type ClientNotificationItem } from './NotificationView';

interface NotificationProps {
	hasNotification: boolean,
	notifications?: ClientNotificationItem[]
	onOpen?: () => void;
}

function Notification(props: NotificationProps) {
	return (
		<div className="dropdown dropdown-end">
			<div
				tabIndex={0}
				role="button"
				onClick={props.onOpen}
				className="
					relative
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

				{/* 🔴 Notification dot */}
				{props.hasNotification && (
					<span
						className="
							absolute
							top-2 right-2
							w-[6px] h-[6px]
							bg-red-500
							rounded-full
						"
					/>
				)}
			</div>

			<div
				tabIndex={0}
				className="
					dropdown-content
					z-50
					mt-3
					w-80
					bg-[#F7F7F7]
					border
					border-gray-400
					rounded-xl
					shadow-lg
					p-2
				"
			>
				<NotificationView notifications={props.notifications ?? []} />
			</div>
		</div>
	);
}

export default Notification;
