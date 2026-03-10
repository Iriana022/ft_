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
			className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
				shadow bg-white min-w-[600px] py-6 px-5 rounded
				transition ${props.isOpen ? "" : "opacity-0 scale-75"}`}
		>
			<div className="flex items-center justify-between">
				<h3 className="text-base">Creer un ticket</h3>
				<div onClick={props.onClose}>
					<CloseButtonX />
				</div>
			</div>
			<Separator />
			<div className="my-3">
				<label className="text-base block" htmlFor="title">Titre</label>
				<input
					type="text"
					id="title"
					placeholder="Entrer le titre de votre ticket ici ..."
					className="border py-3 px-3 text-sm w-full rounded mt-2"
				/>
			</div>
			<div className="my-3">
				<h3 className="text-base mb-2">Priorite</h3>
				<div className="flex items-center gap-5">
					<PriorityChoice priority={TicketPriority.LOW} />
					<PriorityChoice priority={TicketPriority.HIGH} />
					<PriorityChoice priority={TicketPriority.MEDIUM} />
					<PriorityChoice priority={TicketPriority.URGENT} />
				</div>
			</div>
			<div className="my-3">
				<h3 className="text-base mb-2">Description</h3>
				<div>
					<textarea
						placeholder="Entrer la description de votre ticket ici ..."
						className="border py-3 px-3 min-h-30 text-sm w-full rounded"
					/>
				</div>
			</div>
			<div className="flex items-center justify-between mt-7 mb-3">
				<button className="btn btn-soft" onClick={props.onClose}>Annuler</button>
				<button className="btn btn-info" onClick={props.onClose}>Creer un ticket</button>
			</div>
		</ div >
	);
}

export default CreateTicketView;
