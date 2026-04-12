import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Notification from '../../../components/client_components/Notification';
import Avatar from '../../../components/client_components/Avatar';
import {type ClientNotificationItem} from '../../../components/client_components/NotificationView';
import {fetchMyNotifications, readAllMyNotifications, type RawNotification} from '../../../services/tickets';
import {getSocket} from '../../../services/singleton';
import {mapSystemNotificationText, type SystemNotificationEvent} from '../adminHelpers';

const avatar1 = '/assets/avatars/avatar1.jpg';

function VerticalSeparator() {
	return (
		<div className="w-[1px] h-8 bg-gray-300" />
	);
}

export function AdminHeader() {
	const {t} = useTranslation('admin');
	const {t: tn} = useTranslation('notifications');
	const [notifications, setNotifications] = useState<ClientNotificationItem[]>([]);

	const navigate = useNavigate();

	const hasNotification = useMemo(
		() => notifications.some((n) => !n.readAt),
		[notifications],
	);

	useEffect(() => {
		let mounted = true;
		const socket = getSocket();

		const mapFromApi = (row: RawNotification): SystemNotificationEvent => ({
			id: row.id,
			code: row.code,
			createdAt: row.createdAt,
			readAt: row.readAt,
			data: row.payload as SystemNotificationEvent['data'],
		});

		const loadNotifications = async () => {
			const rows = await fetchMyNotifications();
			if (!mounted) return;
			setNotifications(
				rows.map((row) => {
					const event = mapFromApi(row);
					return {
						id: event.id,
						text: mapSystemNotificationText(event, tn),
						createdAt: event.createdAt,
						readAt: event.readAt ?? null,
					};
				}),
			);
		};

		void loadNotifications();

		const onSystemNotification = (event: SystemNotificationEvent) => {
			setNotifications((old) =>
				[
					{
						id: event.id,
						text: mapSystemNotificationText(event, tn),
						createdAt: event.createdAt,
						readAt: event.readAt ?? null,
					},
					...old,
				].slice(0, 50),
			);
		};

		socket.on('systemNotification', onSystemNotification);

		return () => {
			mounted = false;
			socket.off('systemNotification', onSystemNotification);
		};
	}, [tn]);

	const handleOpenNotifications = () => {
		setNotifications((prev) =>
			prev.map((n) => (n.readAt ? n : {...n, readAt: new Date().toISOString()})),
		);
		void readAllMyNotifications();
	};

	return (
		<div className="px-4 w-full flex items-center justify-between">
			<div>
				<h3 className="text-navy">
					{t('dashboard')}
				</h3>
				<span className="text-xs md:text-sm">
					{t('welcomeAdmin')}
				</span>
			</div>
			<div className="flex items-center gap-4">
				<Notification hasNotification={hasNotification} notifications={notifications} onOpen={handleOpenNotifications} />
				<VerticalSeparator />
				<div onClick={() => navigate("profile")}>
					<Avatar src={avatar1} size="sm" />
				</div>
			</div>
		</div >
	);
}
