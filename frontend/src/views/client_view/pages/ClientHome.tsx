import ContainerComp from '../../../layout/layout_client/Container';
import Separator from '../../../components/login_components/Separator';
import ClientHomeHeroSection from '../../../components/client_components/ClientHomeHeroSection';
import ClientHomeMyTicketsSection from '../../../components/client_components/ClientHomeMyTicketsSection';

function ClientHome() {
	return (
		<>
			<ContainerComp>
				<ClientHomeHeroSection />
			</ContainerComp>
			<Separator />
			<ContainerComp>
				<ClientHomeMyTicketsSection />
			</ContainerComp>
			<Separator />
		</>
	);
}

export default ClientHome;
