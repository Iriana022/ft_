interface ConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	loading?: boolean;
}

function ConfirmModal({isOpen, onClose, onConfirm, loading}: ConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-xs"
				onClick={onClose}
			/>

			<div className="relative bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg">
				<h2 className="text-lg font-semibold mb-2">Supprimer le compte</h2>
				<p className="text-sm text-gray-600 mb-6">
					Cette action est irréversible. Voulez-vous vraiment supprimer votre compte ?
				</p>

				<div className="flex justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded text-sm bg-gray-200 hover:bg-gray-300"
					>
						Annuler
					</button>
					<button
						onClick={onConfirm}
						disabled={loading}
						className="px-4 py-2 rounded bg-red-300 text-black text-sm transition hover:bg-red-400 disabled:opacity-60"
					>
						{loading ? "Suppression..." : "Supprimer"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ConfirmModal;
