import {LoginCard} from './LoginCard';
import LanguageSelector from '../../components/client_components/LanguageSelector';
import TikeoLogo from '../../components/client_components/TikeoLogo';

export default function Login() {
	return (
		<div className="relative min-h-screen w-full flex items-center justify-center p-5 transition-colors duration-300">
			<div className="absolute top-10 left-10">
				<TikeoLogo href="/login" color="text-navy" size="text-3xl" />
			</div>
			<div className="absolute top-10 right-10">
				<LanguageSelector />
			</div>
			<LoginCard />
		</div>
	);
}
