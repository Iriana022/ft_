import Ticket from './Ticket';
import TicketsStat from './TicketsStat';
import {Link} from 'react-router-dom';
import {ArrowRightIcon} from '@heroicons/react/24/outline';
import type {TicketType} from '../../types';
import {useTranslation} from 'react-i18next';

const noneTicket = 'assets/none_tickets.png';

interface ClientHomeMyTicketsSectionProps {
	tickets: TicketType[];
	isLoading?: boolean;
}

function ClientHomeMyTicketsSection(props: ClientHomeMyTicketsSectionProps) {
	const {tickets, isLoading = false} = props;

	const {t: t_client} = useTranslation("client_home");

	return (
		<section className="pb-8">
			<h1 className="text-center md:text-start text-navy text-2xl font-semibold py-5">
				{t_client("recentTickets")}
			</h1>
			<div className="flex flex-col gap-10 md:gap-0 md:flex-row items-center">
				<div className="md:w-[60%] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
					{isLoading ? (
						<p className="text-sm text-gray-500">{t_client("loadingTickets")}</p>
					) : tickets.length === 0 ? (
						<div className="flex flex-col items-center justify-center col-span-full py-10 text-gray-400">
							<img
								src={noneTicket}
								alt={t_client("noTicketsImageAlt")}
								className="w-42 h-42 mb-4"
							/>
							<p>{t_client("noTickets")}</p>
						</div>
					) : (
						tickets.slice(0, 4).map((t, i) => <Ticket key={i} ticket={t} />)
					)}
				</div>
				<div className="w-full md:w-[40%] md:ps-15 order-first md:order-none">
					<TicketsStat tickets={tickets} />
				</div>
			</div>
			{
				tickets.length ? (
					<Link to="/client/my_tickets" className="flex items-center gap-2 mt-4 group">
						<span className="text-sm text-blue-400 transition group-hover:text-blue-500">
							{t_client("viewAllTickets")}
						</span>
						<ArrowRightIcon className="w-3 h-3 text-blue-400 transition group-hover:text-blue-500" />
					</Link>
				) : ''
			}
		</section>
	);
}

export default ClientHomeMyTicketsSection;
