export interface ClientNotificationItem {
	id: number;
	text: string;
	createdAt: string;
}

interface NotificationViewProps {
	notifications: ClientNotificationItem[];
}

function formatTimeAgo(isoDate: string) {
	const diffMs = Date.now() - new Date(isoDate).getTime();
	const diffMin = Math.floor(diffMs / 60000);

	if (diffMin < 1) return 'a l instant';
	if (diffMin < 60) return 'il y a ' + diffMin + ' min';

	const diffH = Math.floor(diffMin / 60);
	if (diffH < 24) return 'il y a ' + diffH + ' h';

	const diffD = Math.floor(diffH / 24);
	return 'il y a ' + diffD + ' j';
}

function NotificationView(props: NotificationViewProps) {
	const notifications = props.notifications;

	return (
		<div className="flex flex-col">
			<div className="px-3 py-2 font-semibold border-b">
				Notifications
			</div>

			<div className="max-h-64 overflow-y-auto">
				{notifications.length ? (
					notifications.map((n) => (
						<div
							key={n.id}
							className="
                px-3 py-2
                hover:bg-gray-100
                rounded-lg
                cursor-pointer
                transition
              "
						>
							<div className="text-sm">{n.text}</div>
							<div className="text-xs text-gray-500">{formatTimeAgo(n.createdAt)}</div>
						</div>
					))
				) : (
					<span className="text-sm block mt-3 mb-2">Aucune notification</span>
				)}
			</div>
		</div>
	);
}

export default NotificationView;