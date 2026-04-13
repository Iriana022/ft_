type NotificationLike = {
	readAt?: string | null;
};

export const NOTIFICATIONS_MARKED_AS_READ_EVENT = 'notificationsMarkedAsRead';

export function markNotificationsAsReadLocally<T extends NotificationLike>(
	notifications: T[],
): T[] {
	const readAt = new Date().toISOString();
	return notifications.map((n) => (n.readAt ? n : {...n, readAt}));
}

export function emitNotificationsMarkedAsRead() {
	window.dispatchEvent(new Event(NOTIFICATIONS_MARKED_AS_READ_EVENT));
}

export function subscribeNotificationsMarkedAsRead(listener: () => void) {
	window.addEventListener(NOTIFICATIONS_MARKED_AS_READ_EVENT, listener);
	return () => {
		window.removeEventListener(NOTIFICATIONS_MARKED_AS_READ_EVENT, listener);
	};
}