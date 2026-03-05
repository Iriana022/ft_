import React from 'react';
import Separator from '../components/Separator';
import {Link} from 'react-router-dom';
import ContainerComp from './Container';
import TikeoLogo from '../components/client_components/TikeoLogo';

function Footer() {
	return (
		<footer className="py">
			<ContainerComp>
				<section className="flex flex-col md:flex-row md:justify-between py-3">
					<div className="flex gap-4 items-center md:block">
						<TikeoLogo />
						<p className="text-xs md:text-sm max-w-[500px] mt-3 text-gray-700">
							Vos problèmes méritent une réponse claire et rapide. Créez vos tickets en quelques clics, suivez leur avancement en temps réel et échangez facilement avec l’équipe.
						</p>
					</div>
					<div>
						<h3 className="text-navy font-semibold hidden md:block">
							Liens rapides
						</h3>
						<div className="text-xs md:text-sm flex md:flex-col justify-center md:justify-start gap-4 md:gap-1 mt-6 md:mt-3 text-gray-700 md:mt-0">
							<Link to="/client_view" className="transition hover:text-navy hover:underline">Accueil</Link>
							<Link to="/client_view/my_tickets" className="transition hover:text-navy hover:underline">Mes tickets</Link>
							<Link to="/client_view/settings" className="transition hover:text-navy hover:underline">Parametres</Link>
						</div>
					</div>
				</section >
			</ContainerComp >
			<Separator />
			<ContainerComp>
				<section className="text-gray-600 text-xs flex flex-col md:flex-row items-center justify-between pb-4 gap-4">
					<div>
						<span>Copyright &copy; 2026 Tikeo</span>
					</div>
					<div className="flex items-center flex-col md:flex-row gap-2 md:gap-10">
						<Link to="/client_view" className="hover:underline">Politique de confidentialite</Link>
						<Link to="/client_view" className="hover:underline">Conditions generales d'utilisation</Link>
					</div>
				</section>
			</ContainerComp>
		</footer >
	);
}

export default Footer;
