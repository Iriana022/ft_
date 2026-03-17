import ContainerComp from '../../layout/layout_client/Container';
import Separator from './Separator';
import {useLocation} from 'react-router-dom';
import {ArrowLeftIcon} from '@heroicons/react/24/solid';
import {useNavigate} from 'react-router-dom';
import {type Message} from '../../types';
import Avatar from './Avatar';
import avatar1 from '../../assets/avatars/avatar1.jpg';
import avatar2 from '../../assets/avatars/avatar2.png';

interface TicketMessageHeaderProps {
	title: string,
}

interface TicketMessageBodyProps {
	messages: Message[]
}

// Make this dynamic later
const fakeMessages: Message[] = [
	{client: "Bonjour, j'ai besoin d'aide pour ma commande.", agent: "Bonjour ! Bien sûr, pouvez-vous me donner votre numéro de commande ?"},
	{client: "Je n'arrive pas à me connecter à mon compte.", agent: "Nous allons réinitialiser votre mot de passe. Pouvez-vous confirmer votre email ?"},
	{client: "Quand est-ce que mon colis va arriver ?", agent: "Il devrait arriver dans un délai de 3 à 5 jours ouvrables."},
	{client: "J'ai reçu le mauvais article.", agent: "Désolé pour cela ! Nous allons vous envoyer le bon article immédiatement."},
	{client: "Comment appliquer un code promo ?", agent: "Vous pouvez entrer le code au moment du paiement dans le champ 'Code promo'."},
	{client: "Faites-vous la livraison internationale ?", agent: "Oui, nous livrons dans la plupart des pays."},
	{client: "Mon paiement a été refusé.", agent: "Veuillez vérifier les informations de votre carte ou essayer un autre moyen de paiement."},
	{client: "Puis-je annuler ma commande ?", agent: "Vous pouvez annuler votre commande dans les 24 heures suivant l'achat."},
	{client: "Ce produit est-il en stock ?", agent: "Oui, ce produit est actuellement disponible."},
	{client: "Merci pour votre aide !", agent: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions."}
];

function TicketMessageHeader(props: TicketMessageHeaderProps) {
	const navigate = useNavigate();

	return (
		<div className="sticky top-0 z-50 bg-[#FBF6F6]">
			<ContainerComp>
				<div className="chat-header flex items-center pt-10 pb-4 gap-6">
					<button onClick={() => navigate(-1)} className="cursor-pointer">
						<ArrowLeftIcon className="w-5 h-5" />
					</button>
					<h3 className="text-md md:text-xl">{props.title}</h3>
				</div>
			</ContainerComp>
			<Separator />

		</div>
	);
}

function TicketMessageBody({messages}: TicketMessageBodyProps) {
	return (
		<ContainerComp>
			<div className="flex flex-col space-y-4 p-4 overflow-y-auto max-h-screen]">
				{messages.map((msg, index) => (
					<div key={index} className="space-y-3">
						<div className="chat chat-end">
							<div className="chat-image avatar">
								<Avatar src={avatar1} size="sm" />
							</div>
							<div className="chat-bubble chat-bubble-info text-sm md:text-base">
								{msg.client}
							</div>
						</div>
						<div className="chat chat-start">
							<div className="chat-image avatar">
								<Avatar src={avatar2} size="sm" />
							</div>
							<div className="chat-bubble text-sm md:text-base">
								{msg.agent}
							</div>
						</div>
					</div>
				))}
			</div>
		</ContainerComp>
	);
}

function TicketMessageFooter() {
	return (
		<div className="sticky bottom-0 left-0 right-0 z-50 bg-base-100 border-t">
			<ContainerComp>
				<div className="w-full px-4 py-3">
					<div className="flex gap-2 w-full items-center">
						<input
							type="text"
							placeholder="Écrire un message..."
							className="input input-bordered w-full min-h-[50px] bg-gray-100 text-sm md:text-base"
						/>
						<button className="btn btn-primary">
							Envoyer
						</button>
					</div>
				</div>
			</ContainerComp>
		</div>
	);
}

function TicketMessage() {
	const location = useLocation();
	const {state} = location;

	return (
		<>
			<TicketMessageHeader title={state.title} />
			<TicketMessageBody messages={fakeMessages} />
			<TicketMessageFooter />
		</>
	);
}

export default TicketMessage;
