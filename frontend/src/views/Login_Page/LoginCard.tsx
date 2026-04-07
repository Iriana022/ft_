import {Mail, Lock, Eye, EyeOff, Sun, Moon} from 'lucide-react';
import {useState, useEffect, type FormEvent} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {Button} from '../../components/login_components/button';
import {Input} from '../../components/login_components/input';
import Separator from '../../components/login_components/Separator';
import api from '../../services/api';
import {getHomeRouteByRole, getRoleFromToken} from '../../services/auth';
import GoogleButton from '../../components/login_components/GoogleButton';

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
		<div className="w-full max-w-md p-8 rounded-2xl bg-white border border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)]">

			{/* Title */}
			<div className="text-center mb-8">
				<h1 className="text-2xl font-bold mb-2 text-gray-900">
					LOGIN
				</h1>
				<p className="text-gray-600">
					Sign in to your account to continue
				</p>
			</div>

			{/* Success Message */}
			{successMessage && (
				<div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600">
					{successMessage}
				</div>
			)}

			{/* Error Message */}
			{error && (
				<div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				{/* Email */}
				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Email</label>
					<div className="relative">
						<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="pl-10 h-11 bg-white"
							placeholder="Enter your email"
						/>
					</div>
				</div>

				{/* Password */}
				<div className="mb-2">
					<label className="block mb-2 text-gray-700">Password</label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<Input
							type={showPassword ? 'text' : 'password'}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="pl-10 pr-10 h-11 bg-white"
							placeholder="Enter your password"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
						>
							{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
				</div>

				{/* Forgot */}
				<div className="mb-6 text-right">
					<a href="#" className="text-sm text-indigo-500 hover:underline">
						Forgot Password?
					</a>
				</div>

				{/* Submit */}
				<Button type="submit" disabled={loading} className="w-full h-11 mb-6 font-semibold bg-indigo-600 text-white">
					{loading ? 'Signing in...' : 'Sign In'}
				</Button>
			</form>

			{/* Separator */}
			<div className="relative mb-6">
				<Separator />
				<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-sm bg-white text-gray-500">
					Or continue with
				</span>
			</div>

			{/* Google */}
			<GoogleButton handleClick={handleGoogleLogin} label="Google" />

			{/* Register */}
			<div className="mt-6 text-center text-sm text-gray-600">
				Don't have an account?{' '}
				<a href="/register" className="font-semibold text-indigo-500 hover:underline">
					Create an account
				</a>
			</div>
		</div>
	);
}
