import ContainerComp from "../../../layout/Container";
import Separator from "../../../components/client_components/Separator";
import LanguageSelector from "../../../components/client_components/LanguageSelector";

function ClientSettings() {
	return (
		<div>
			<ContainerComp>
				<h1 className="font-poppins text-navy font-semibold mb-2">
					Parametres
				</h1>
				<Separator />
				<div className="flex items-center justify-between max-w-[600px]">
					<h3 className="text-base">Langage</h3>
					<LanguageSelector />
				</div>
			</ContainerComp>
		</div>
	);
}

export default ClientSettings;
