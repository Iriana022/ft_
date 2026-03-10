import React from 'react';
import Separator from './Separator';
import CloseButtonX from './CloseButtonX';
import PriorityChoice from './PriorityChoice';
import {TicketPriority} from '../../types';

interface CreateTicketViewProps {
	isOpen: boolean,
	onClose: () => void,
}

function CreateTicketView(props: CreateTicketViewProps) {
	return (
		<div
			className={`fixed inset-0 z-50 px-3 flex items-center justify-center
			transition-all duration-200
			${props.isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
			bg-black/20 backdrop-blur-sm`}
		>
			<div
				className={`shadow bg-cream w-full max-w-xl  p-5 rounded
				transition-all duration-200
				${props.isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
			>
				<div className="flex items-center justify-between">
					<h3 className="text-base">Créer un ticket</h3>
					<div onClick={props.onClose}>
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
					/>
				</div>

				<div className="my-4">
					<h3 className="text-base mb-3">Priorité</h3>

					<div className="flex items-center gap-5">
						<PriorityChoice priority={TicketPriority.LOW} />
						<PriorityChoice priority={TicketPriority.MEDIUM} />
						<PriorityChoice priority={TicketPriority.HIGH} />
						<PriorityChoice priority={TicketPriority.URGENT} />
					</div>
				</div>

				<div className="my-4">
					<h3 className="text-base mb-2">Description</h3>

					<textarea
						placeholder="Entrer la description de votre ticket ici ..."
						className="border py-3 px-3 min-h-[120px] text-sm w-full rounded"
					/>
				</div>

				<div className="flex items-center justify-between mt-7 mb-3">
					<button
						className="btn btn-soft"
						onClick={props.onClose}
					>
						Annuler
					</button>

					<button
						className="btn btn-info"
						onClick={props.onClose}
					>
						Créer un ticket
					</button>
				</div>
			</div>
		</div>
	);
}

export default CreateTicketView;
