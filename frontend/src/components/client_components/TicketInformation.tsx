import {useState} from 'react';
import Separator from './Separator';
import CloseButtonX from './CloseButtonX';
import PriorityChoice from './PriorityChoice';
import {type TicketType} from '../../types';
import {ChatBubbleLeftEllipsisIcon} from '@heroicons/react/24/outline';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

interface TicketInformationProps {
	ticket: TicketType,
	isOpen: boolean,
	onClose: () => void,
}

function TicketInformation(props: TicketInformationProps) {
	const {t} = useTranslation('tickets');
	const [title, setTitle] = useState(props.ticket.title);
	const [description, setDescription] = useState(props.ticket.description);
	const navigate = useNavigate();

	return (
		<div
			className={`fixed inset-0 z-50 px-3 flex items-center justify-center
			transition-all duration-200
			${props.isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
			bg-black/20 backdrop-blur-sm`}
		>
			<div
				className={`shadow bg-cream w-full max-w-xl  p-5 rounded-md
				transition-all duration-200
				${props.isOpen ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
			>
				<div className="flex items-center justify-between">
					<h3 className="text-base">{title}</h3>
					<div onClick={props.onClose}>
						<CloseButtonX />
					</div>
				</div>

				<Separator />

				<div>
					<h4 className="text-base mb-1">{t('messages')}</h4>
					<button
						className="btn btn-sm btn-soft relative"
						onClick={() => navigate('/chat_ticket_client', {state: props.ticket})}
					>
						<ChatBubbleLeftEllipsisIcon className="w-5 h-5" />
						{
							props.ticket.hasMessage ?
								(<span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />) :
								""
						}
					</button>
				</div>

				<div className="my-4">
					<label className="text-base block" htmlFor="title">
						{t('title')}
					</label>

					<input
						type="text"
						id="title"
						placeholder={t('titlePlaceholder')}
						className="border py-3 px-3 text-sm w-full rounded mt-2"
						value={title}
						onChange={e => setTitle(e.target.value)}
					/>
				</div>

				<div className="my-4">
					<h3 className="text-base mb-3">{t('priority')}</h3>

					<div className="flex items-center gap-5">
						{/* TODO: allow changement on priority */}
						<PriorityChoice priority={props.ticket.priority} active={true} onClick={() => {}} />
					</div>
				</div>

				<div className="my-4">
					<h3 className="text-base mb-2">{t('description')}</h3>

					<textarea
						placeholder={t('descriptionPlaceholder')}
						className="border py-3 px-3 min-h-[120px] text-sm w-full rounded"
						value={description}
						onChange={e => setDescription(e.target.value)}
					/>
				</div>

				<div className="flex justify-end">
					<button
						className="btn btn-info"
						onClick={props.onClose}
					>
						{t('save')}
					</button>
				</div>
			</div>
		</div>
	);
}

export default TicketInformation;
