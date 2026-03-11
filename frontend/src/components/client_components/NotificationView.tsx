interface NotificationShape {
	id: number,
	text: string,
	time: string,
}
function NotificationView() {
	const notifications: NotificationShape[] = [
		{
			id: 1,
			text: "Nouveau ticket créé",
			time: "il y a 2 min",
		},
		{
			id: 2,
			text: "Ticket mis à jour",
			time: "il y a 10 min",
		},
		{
			id: 3,
			text: "Priorité changée",
			time: "il y a 1 h",
		},
	];

	return (
		<div className="flex flex-col">
			<div className="px-3 py-2 font-semibold border-b">
				Notifications
			</div>

			<div className="max-h-64 overflow-y-auto">
				{notifications.length ? notifications.map(n => (
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
						<div className="text-sm">
							{n.text}
						</div>

						<div className="text-xs text-gray-500">
							{n.time}
						</div>
					</div>
				)) : <span className="text-sm block mt-3 mb-2">Aucune notifications</span>}
			</div>
			{
				notifications.length ?
					(< div className="border-t mt-1">
						<button className="w-full py-2 text-sm text-navy hover:bg-gray-100 rounded-lg">
							Voir tout
						</button>
					</div>) : ""
			}

		</div >
	);
}

export default NotificationView;
