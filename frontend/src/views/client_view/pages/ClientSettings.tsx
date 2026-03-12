import ContainerComp from "../../../layout/layout_client/Container";
import Separator from "../../../components/client_components/Separator";
import LanguageSelector from "../../../components/client_components/LanguageSelector";
import ThemeController from "../../../components/client_components/ThemeController";

function ClientSettings() {
	return (
		<div className="min-h-[calc(100vh-300px)]">
			<ContainerComp>
				<h1 className="font-poppins text-navy font-semibold mb-2 mt-10">
					Parametres
				</h1>
				<Separator />
				<div className="flex items-center justify-between py-3">
					<h3 className="text-base">Langage</h3>
					<LanguageSelector />
				</div>
				<Separator />
				<div className="flex items-center justify-between py-3">
					<h3 className="text-base">Mode sombre</h3>
					<ThemeController />
				</div>
				<Separator />
				<div className="flex items-center justify-between py-3">
					<h3 className="text-base">Compte</h3>
					<button className="text-sm bg-red-300 p-3 rounded transition hover:bg-red-400 cursor-pointer">
						Supprimer mon compte
					</button>
				</div>
			</ContainerComp>
		</div>
	);
}

export default ClientSettings;
