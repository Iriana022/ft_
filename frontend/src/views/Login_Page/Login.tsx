import {LoginCard} from './LoginCard';
import LanguageSelector from '../../components/client_components/LanguageSelector';

export default function Login() {
	return (
		<div className="relative min-h-screen w-full flex items-center justify-center p-5 transition-colors duration-300">
			<div className="absolute top-10 right-10">
				<LanguageSelector />
			</div>
			<LoginCard />
		</div>
	);
}
