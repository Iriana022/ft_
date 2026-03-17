import {useState} from 'react';
import Separator from './Separator';
import CloseButtonX from './CloseButtonX';
import PriorityChoice from './PriorityChoice';
import {TicketPriority} from '../../types';
import { createClientTicket } from '../../services/tickets';

interface CreateTicketViewProps {
	isOpen: boolean,
	onClose: () => void,
	onTicketCreated?: () => void,
}

function CreateTicketView(props: CreateTicketViewProps) {
	const [activePriority, setActivePriority] = useState<TicketPriority | undefined>(undefined);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const handlePriorityChoice = (priority: TicketPriority) => {
		setActivePriority(priority);
	}

	const resetForm = () => {
		setTitle('');
		setDescription('');
		setActivePriority(undefined);
		setErrorMessage('');
		setSuccessMessage('');
	};

	const handleClose = () => {
		resetForm();
		props.onClose();
	};

	const handleCreateTicket = async () => {
		setErrorMessage('');
		setSuccessMessage('');

		if (title.trim().length < 3) {
			setErrorMessage('Le titre doit contenir au moins 3 caractères.');
			return;
		}

		if (description.trim().length < 10) {
			setErrorMessage('La description doit contenir au moins 10 caractères.');
			return;
		}

		setIsSubmitting(true);

		try {
			await createClientTicket({
				title: title.trim(),
				description: description.trim(),
				priority: activePriority ?? TicketPriority.MEDIUM,
			});

			setSuccessMessage('Ticket créé avec succès.');
			props.onTicketCreated?.();
			setTimeout(() => {
				handleClose();
			}, 700);
		} catch (error) {
			setErrorMessage('Impossible de créer le ticket. Vérifie que tu es connecté.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className={`fixed inset-0 z-50 px-3 flex items-center justify-center
			transition-all duration-200
			${props.isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
			bg-black/20 backdrop-blur-sm`}
		>
			<div
				className={`shadow bg-cream w-full max-w-xl p-5 rounded-md
				transition-all duration-200
				${props.isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
			>
				<div className="flex items-center justify-between">
					<h3 className="text-base">Créer un ticket</h3>
					<div onClick={handleClose}>
						<CloseButtonX />
					</div>
				</div>

				<Separator />

				<div className="my-4">
					<label className="text-base block" htmlFor="title">
						Titre
					</label>

					<input
						type="text"
						id="title"
						placeholder="Entrer le titre de votre ticket ici ..."
						className="border py-3 px-3 text-sm w-full rounded mt-2"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>

				<div className="my-4">
					<h3 className="text-base mb-3">Priorité</h3>

					<div className="flex items-center gap-5">
						<PriorityChoice priority={TicketPriority.LOW} active={activePriority === TicketPriority.LOW} onClick={handlePriorityChoice} />
						<PriorityChoice priority={TicketPriority.MEDIUM} active={activePriority === TicketPriority.MEDIUM} onClick={handlePriorityChoice} />
						<PriorityChoice priority={TicketPriority.HIGH} active={activePriority === TicketPriority.HIGH} onClick={handlePriorityChoice} />
						<PriorityChoice priority={TicketPriority.URGENT} active={activePriority === TicketPriority.URGENT} onClick={handlePriorityChoice} />
					</div>
				</div>

				<div className="my-4">
					<h3 className="text-base mb-2">Description</h3>

					<textarea
						placeholder="Entrer la description de votre ticket ici ..."
						className="border py-3 px-3 min-h-[120px] text-sm w-full rounded"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				{errorMessage && (
					<p className="text-red-500 text-sm mb-2">{errorMessage}</p>
				)}
				{successMessage && (
					<p className="text-green-600 text-sm mb-2">{successMessage}</p>
				)}

				<div className="flex items-center justify-between mt-7 mb-3">
					<button
						className="btn btn-soft"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Annuler
					</button>

					<button
						className="btn btn-info"
						onClick={handleCreateTicket}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Création...' : 'Créer un ticket'}
					</button>
				</div>
			</div>
		</div>
	);
}

export default CreateTicketView;
