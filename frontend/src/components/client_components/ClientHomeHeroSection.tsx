import HeroImage from '../../assets/hero_image.png';
import Button from './Button';
import {PlusCircleIcon} from '@heroicons/react/24/outline';

function ClientHomeHeroSection() {
	return (
		<section className="flex items-center pt-15 pb-7">
			<div className="w-[100%] md:w-[50%] flex items-center md:items-start flex-col gap-5">
				<h1 className="text-4xl font-bold font-inter">Bonjour, <span className="text-navy">Dontoman</span></h1>
				<p className="text-center md:text-start">
					Vos problèmes méritent une solution claire et rapide. Créez vos tickets en quelques clics, suivez leur statut en direct, échangez facilement avec les agents. Une gestion de support moderne, fluide et sans perte d’information.
				</p>
				<div className="mt-7">
					<Button bgColor="bg-navy" textColor="text-cream" text="Creer un ticket" icon={PlusCircleIcon} />
				</div>
			</div>
			<div className="w-[50%] ps-30 hidden md:block">
				<img alt="Hero image" src={HeroImage} />
			</div>
		</section>
	);
}

export default ClientHomeHeroSection;
