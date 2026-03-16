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
	{client: "Hello, I need help with my order.", agent: "Hi! Sure, can you give me your order ID?"},
	{client: "I can't log into my account.", agent: "Let's reset your password. Can you confirm your email?"},
	{client: "When will my package arrive?", agent: "It should arrive within 3–5 business days."},
	{client: "I received the wrong item.", agent: "I'm sorry for that! We'll send the correct item immediately."},
	{client: "How do I apply a discount code?", agent: "You can enter the code at checkout under 'Promo Code'."},
	{client: "Do you offer international shipping?", agent: "Yes, we ship to most countries worldwide."},
	{client: "My payment was declined.", agent: "Please check your card details or try another payment method."},
	{client: "Can I cancel my order?", agent: "You can cancel within 24 hours of placing the order."},
	{client: "Is this product in stock?", agent: "Yes, we currently have it available."},
	{client: "Thank you for your help!", agent: "You're welcome! Have a great day."}
];

function TicketMessageHeader(props: TicketMessageHeaderProps) {
	const navigate = useNavigate();

	return (
		<>
			<ContainerComp>
				<div className="chat-header flex items-center pt-10 pb-4 gap-6">
					<button onClick={() => navigate(-1)} className="cursor-pointer">
						<ArrowLeftIcon className="w-5 h-5" />
					</button>
					<h3 className="text-xl">{props.title}</h3>
				</div>
			</ContainerComp>
			<Separator />

		</>
	);
}

function TicketMessageBody({messages}: TicketMessageBodyProps) {
	return (
		<ContainerComp>
			<div className="flex flex-col space-y-4 p-4 overflow-y-auto max-h-screen]">
				{messages.map((msg, index) => (
					<div>
						<div className="chat chat-end">
							<div className="char-image avatar">
								<Avatar src={avatar1} size="md" />
							</div>
							<div className="chat-bubble chat-bubble-info">
								{msg.client}
							</div>
						</div>
						<div className="chat chat-start">
							<div className="char-image avatar">
								<Avatar src={avatar2} size="md" />
							</div>
							<div className="chat-bubble">
								{msg.agent}
							</div>
						</div>
					</div>
				))}
			</div>
		</ContainerComp >
	);
}

function TicketMessage() {
	const location = useLocation();
	const {state} = location;

	return (
		<>
			<TicketMessageHeader title={state.title} />
			<TicketMessageBody messages={fakeMessages} />
		</>
	);
}

export default TicketMessage;
