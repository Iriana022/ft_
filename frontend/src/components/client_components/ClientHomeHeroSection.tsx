import {useState, useEffect} from 'react';
import Button from './Button';
import {PlusCircleIcon} from '@heroicons/react/24/outline';
import CreateTicketView from './CreateTicketView';
import {getMyProfile} from '../../services/profile';
import {useTranslation} from 'react-i18next';

const heroImage = '/assets/hero_image.png'

interface ClientHomeHeroSectionProps {
	onTicketCreated?: () => void;
}

function ClientHomeHeroSection(props: ClientHomeHeroSectionProps) {
	const [isTicketViewOpen, setIsTicketViewOpen] = useState(false);
	const [username, setUsername] = useState('Utilisateur');

	const {t} = useTranslation("client_home");

	useEffect(() => {
		let mounted = true;

		void getMyProfile()
			.then((profile) => {
				if (!mounted) return;
				if (profile?.login) setUsername(profile.login);
			})
			.catch(() => {
			});

		return () => {
			mounted = false;
		};
	}, []);

	const handleClick = () => {
		setIsTicketViewOpen(true);
	}

	const onClose = () => {
		setIsTicketViewOpen(false);
	}

	return (
		<section className="flex items-center pt-15 pb-7">
			<CreateTicketView isOpen={isTicketViewOpen} onClose={onClose} onTicketCreated={props.onTicketCreated} />
			<div className="w-[100%] md:w-[50%] flex items-center md:items-start flex-col gap-5">
				<h1 className="text-4xl font-bold font-inter text-gray-700">{t("hello")}, <span className="text-navy">{username}</span></h1>
				<p className="text-center md:text-start">
					{t("tikeoDescriptionHero")}.
				</p>
				<div className="mt-7"
					onClick={handleClick}
				>
					<Button bgColor="bg-navy" textColor="text-cream" text={t("createTicket")} icon={PlusCircleIcon} />
				</div>
			</div>
			<div className="w-[50%] ps-30 hidden md:block">
				<img alt={t("heroImageAlt")} src={heroImage} />
			</div>
		</section>
	);
}

export default ClientHomeHeroSection;
