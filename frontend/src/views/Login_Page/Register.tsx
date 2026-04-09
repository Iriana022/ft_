import {RegisterCard} from './RegisterCard';
import LanguageSelector from '../../components/client_components/LanguageSelector';
import TikeoLogo from '../../components/client_components/TikeoLogo';

export default function Register() {
	return (
		<div className="relative min-h-screen w-full flex items-center justify-center p-8 transition-colors duration-300">
			<div className="absolute top-10 left-10">
				<TikeoLogo href="/login" color="text-navy" size="text-3xl" />
			</div>
			<div className="absolute top-10 right-10">
				<LanguageSelector />
			</div>
			<RegisterCard />
		</div >
	);
}
