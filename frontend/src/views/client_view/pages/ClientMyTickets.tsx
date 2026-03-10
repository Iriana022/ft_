import ContainerComp from "../../../layout/Container";
import Separator from "../../../components/client_components/Separator";
import Ticket from "../../../components/client_components/Ticket";
import {tickets} from "../../../data";
import SearchInput from "../../../components/client_components/SearchInput";
import TicketFilter from "../../../components/client_components/TicketFilter";

function ClientMyTickets() {
	const status = ["Tous", "Ouvert", "En cours", "En attente", "Resolu"];
	const priorities = ["Basse", "Moyenne", "Haute", "Urgente"];

	return (
		<>
			<div className="pt-6 pb-10">
				<ContainerComp>
					<h1 className="font-poppins text-navy font-semibold mb-7">
						Mes Tickets
					</h1>
					<div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
						<SearchInput />
						<TicketFilter list={status} />
						<TicketFilter list={priorities} />
					</div>
					<p className="my-4">Tous les tickets</p>
					<div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
						{
							tickets.map((t, i) => (
								<Ticket ticket={t} key={i} />
							))
						}
					</div>
				</ContainerComp>
			</div>
			<Separator />
		</>
	);
}

export default ClientMyTickets;
