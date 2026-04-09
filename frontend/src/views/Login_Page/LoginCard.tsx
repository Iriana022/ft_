import {useState, useEffect, type FormEvent} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {Button} from '../../components/login_components/button';
import Separator from '../../components/login_components/Separator';
import api from '../../services/api';
import {getHomeRouteByRole, getRoleFromToken} from '../../services/auth';
import GoogleButton from '../../components/login_components/GoogleButton';
import {
	EnvelopeIcon,
	LockClosedIcon,
	EyeIcon,
	EyeSlashIcon,
} from '@heroicons/react/24/outline';
import {Link} from 'react-router-dom';

export function LoginCard() {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();

	const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

	useEffect(() => {
		if (successMessage) {
			const timer = setTimeout(() => setSuccessMessage(''), 7000);
			return () => clearTimeout(timer);
		}
	}, [successMessage]);

	useEffect(() => {
		const qpError = new URLSearchParams(location.search).get('error');

		if (qpError === 'email_exists_google') {
			setError('Email deja associe a un compte, veuillez vous connecter.');
		} else if (qpError === 'google_failed' || qpError === 'auth_failed') {
			setError('Echec de l authentification Google.');
		}
	}, [location.search]);

	const handleGoogleLogin = () => {
		window.location.href = 'https://localhost:8443/api/auth/google/login?flow=login';
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const response = await api.post('/auth/login', {email, password});
			const {access_token} = response.data;

			localStorage.setItem('access_token', access_token);

			try {
				const meResponse = await api.get('/auth/me');
				const username = meResponse.data?.username;
				const role = meResponse.data?.role ?? getRoleFromToken(access_token);

				if (username) localStorage.setItem('username', username);
				if (role) localStorage.setItem('user_role', role);

				navigate(getHomeRouteByRole(role));
			} catch {
				const role = getRoleFromToken(access_token);
				if (role) localStorage.setItem('user_role', role);
				navigate(getHomeRouteByRole(role));
			}

		} catch (err: any) {
			setError(err.response?.data?.message || "Identifiants incorrects");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative w-full max-w-md p-8 rounded-2xl bg-gray-50 border border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)]">
			<div className="text-center mb-8 flex flex-col gap-5">
				<div>
					<h1 className="text-xl font-semibold mb-1 text-navy">
						Se connecter
					</h1>
					<p className="text-sm text-gray-600">
						Connectez-vous à votre compte pour continuer
					</p>
				</div>
			</div>

			{successMessage && (
				<div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600">
					{successMessage}
				</div>
			)}

			{error && (
				<div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label className="text-sm md:text-base block mb-2 text-gray-700">Email</label>
					<div className="relative">
						<EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
						<input
							type="email"
							data-slot="input"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="pl-10 h-11 w-full rounded-lg border border-gray-300
								bg-cream/50 text-xs md:text-sm text-gray-800 placeholder-gray-500
								focus:outline-none focus:ring-2 focus:ring-navy focus:ring-opacity-50
								focus:border-navy/81
								hover:border-gray-399
								disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
								transition-colors duration-200 ease-in-out"
							placeholder="Entrer votre email"
							required
						/>
					</div>
				</div>

				<div className="mb-2">
					<label className="text-sm md:text-base block mb-2 text-gray-700">Mot de passe</label>
					<div className="relative">
						<LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
						<input
							type={showPassword ? "text" : "password"}
							data-slot="input"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="pl-10 h-11 pr-10 w-full rounded-lg border border-gray-300
								bg-cream/50 text-xs md:text-sm text-gray-800 placeholder-gray-500
								focus:outline-none focus:ring-2 focus:ring-navy focus:ring-opacity-50
								focus:border-navy/81
								hover:border-gray-399
								disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
								transition-colors duration-200 ease-in-out"
							placeholder="Entrer votre mot de passe"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
						>
							{showPassword ? <EyeSlashIcon className="w-4 h-4 md:w-5 md:h-5" /> : <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />}
						</button>
					</div>
				</div>

				{/* Submit */}
				<Button
					type="submit"
					disabled={loading}
					className="w-full h-11 my-6 font-semibold bg-navy text-white hover:bg-[#2e4f70] transition-colors"
				>
					{loading ? 'Connexion en cours...' : 'Se connecter'}
				</Button>
			</form>

			{/* Separator */}
			<div className="relative mb-6">
				<Separator />
				<span className="text-xs md:text-sm absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-sm bg-gray-50 text-gray-500">
					Ou continuer avec
				</span>
			</div>

			{/* Google */}
			<GoogleButton handleClick={handleGoogleLogin} label="Google" />

			{/* Register */}
			<div className="mt-6 text-center text-sm text-gray-600">
				Pas de compte ?{' '}
				<Link to="/register" className="font-semibold text-navy hover:underline">
					Créer un compte
				</Link>
			</div>
		</div>
	);
}
