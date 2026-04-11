import {useTranslation} from 'react-i18next';

export interface ClientNotificationItem {
	id: number;
	text: string;
	createdAt: string;
}

interface NotificationViewProps {
	notifications: ClientNotificationItem[];
}

function formatTimeAgo(isoDate: string, t: (key: string, options?: Record<string, unknown>) => string) {
	const diffMs = Date.now() - new Date(isoDate).getTime();
	const diffMin = Math.floor(diffMs / 60000);

	if (diffMin < 1) return t('justNow');
	if (diffMin < 60) return t('minutesAgo', {count: diffMin});

	const diffH = Math.floor(diffMin / 60);
	if (diffH < 24) return t('hoursAgo', {count: diffH});

	const diffD = Math.floor(diffH / 24);
	return t('daysAgo', {count: diffD});
}

function NotificationView(props: NotificationViewProps) {
	const notifications = props.notifications;
	const {t} = useTranslation('notifications');

	return (
		<div className="flex flex-col">
			<div className="px-3 py-2 font-semibold border-b">
				{t('title')}
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
							<div className="text-xs text-gray-500">{formatTimeAgo(n.createdAt, t)}</div>
						</div>
					))
				) : (
					<span className="text-sm block mt-3 mb-2">{t('empty')}</span>
				)}
			</div>
		</div>
	);
}

export default NotificationView;