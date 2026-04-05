import {UserIcon, BriefcaseIcon} from "@heroicons/react/24/outline";

export function SelectRole() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
				<h1 className="text-2xl font-semibold text-center mb-6">
					Choisissez votre rôle
				</h1>
				<div className="flex flex-col gap-4">
					<button
						className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-100 transition"
					>
						<UserIcon className="w-6 h-6 text-blue-500" />
						<div className="text-left">
							<p className="font-medium">Client</p>
							<p className="text-sm text-gray-500">
								Soumettre et suivre vos tickets
							</p>
						</div>
					</button>
					<button
						className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-100 transition"
					>
						<BriefcaseIcon className="w-6 h-6 text-green-500" />
						<div className="text-left">
							<p className="font-medium">Agent</p>
							<p className="text-sm text-gray-500">
								Gérer et résoudre les tickets
							</p>
						</div>
					</button>

				</div>
			</div>
		</div>
	);
}

export default SelectRole;
