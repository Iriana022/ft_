import Ticket from './Ticket';
import TicketsStat from './TicketsStat';
import {Link} from 'react-router-dom';
import {ArrowRightIcon} from '@heroicons/react/24/outline';
import type { TicketType } from '../../types';

interface ClientHomeMyTicketsSectionProps {
	tickets: TicketType[];
	isLoading?: boolean;
}

function ClientHomeMyTicketsSection(props: ClientHomeMyTicketsSectionProps) {
	const { tickets, isLoading = false } = props;
	return (
		<section className="pb-8">
			<h1 className="text-center md:text-start text-navy text-2xl font-semibold py-5">
				Mes tickets recents
			</h1>
			<div className="flex flex-col gap-10 md:gap-0 md:flex-row items-center">
				<div className="md:w-[60%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
					{isLoading ? (
						<p className="text-sm text-gray-500">Chargement des tickets...</p>
					) : (
						tickets.slice(0, 4).map((t, i) =>
							(<Ticket key={i} ticket={t} />))
					)}
				</div>
				<div className="w-full md:w-[40%] md:ps-15 order-first md:order-none">
					<TicketsStat tickets={tickets} />
				</div>
			</div>
			<Link to="/client_view/my_tickets" className="flex items-center gap-2 mt-4 group">
				<span className="text-sm text-blue-400 transition group-hover:text-blue-500">
					Voir tous les tickets
				</span>
				<ArrowRightIcon className="w-3 h-3 text-blue-400 transition group-hover:text-blue-500" />
			</Link>
		</section>
	);
}

export default ClientHomeMyTicketsSection;
