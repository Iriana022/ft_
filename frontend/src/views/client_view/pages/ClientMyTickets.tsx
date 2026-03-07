import ContainerComp from "../../../layout/Container";
import Separator from "../../../components/client_components/Separator";
import Ticket from "../../../components/client_components/Ticket";
import {tickets} from "../../../data";
import SearchInput from "../../../components/client_components/SearchInput";

function ClientMyTickets() {
	return (
		<>
			<div className="pt-6 pb-10">
				<ContainerComp>
					<h1 className="font-poppins text-navy font-semibold mb-7">
						Mes Tickets
					</h1>
					<div>
						<SearchInput />
					</div>
					<p className="my-4">Tous les tickets</p>
					<div className="grid grid-cols-4 gap-4">
						{
							tickets.map((t, i) => (
								<Ticket title={t.title} description={t.description} status={t.status} priority={t.priority} key={i} />
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
