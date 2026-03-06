import ContainerComp from "../../../layout/Container";
import Separator from "../../../components/client_components/Separator";
import Ticket from "../../../components/client_components/Ticket";
import {tickets} from "../../../data";

function SearchInput() {
	{/* manage focus style */}
	return (
		< label className="input input-bordered flex items-center gap-2 rounded-full bg-gray-200/42" >
			<svg
				className="h-[1em] opacity-50"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				<g
					strokeLinejoin="round"
					strokeLinecap="round"
					strokeWidth="2.5"
					fill="none"
					stroke="currentColor"
				>
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.3-4.3"></path>
				</g>
			</svg>
			<input
				type="search"
				className="grow text-sm focus:outline-none"
				placeholder="Rechercher un ticket ..."
			/>
		</label>
	);
}

function ClientMyTickets() {
	return (
		<>
			<div className="pt-6 pb-10">
				<ContainerComp>
					<h1 className="font-poppins text-navy font-semibold mb-7">
						Mes Tickets
					</h1>
					<SearchInput />
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
