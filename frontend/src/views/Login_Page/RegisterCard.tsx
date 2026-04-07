import { Mail, Lock, Eye, EyeOff, Sun, Moon, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/login_components/button';
import { Input } from '../../components/login_components/input';
import Separator from '../../components/login_components/Separator';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
// import { getHomeRouteByRole, getRoleFromToken } from '../../services/auth';

export function RegisterCard() {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'AGENT'>('CLIENT');
	const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();

	const isDark = theme === 'dark';

	console.log("Base URL utilisée :", api.defaults.baseURL);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		await handleCreateAccount();
		// setIsRoleModalOpen(true);
	};

	const handleGoogleRegister = () => {
		window.location.href = 'https://localhost:8443/api/auth/google/login?flow=register';
	};

	const handleCreateAccount = async () => {
		setError('');
		setLoading(true);

		try {
			// Inscription
			await api.post('/auth/register', {
				email,
				password,
				login: username,
				role: selectedRole,
			});
			setIsRoleModalOpen(false);
			navigate('/login', { state: { message: 'Inscription réussie, veuillez vous connecter !' } });
			console.log('Inscription réussie !');

		} catch (err: any) {
			console.error("Erreur lors de l'inscription :", err.response?.data?.message || err.message);
			const backendMessage = err.response?.data?.message;

			if (Array.isArray(backendMessage)) {
				setError(backendMessage[0]);
			} else {
				setError(backendMessage || "Erreur lors de l'inscription");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className={`w-full max-w-md p-8 rounded-2xl transition-all relative ${isDark
				? 'bg-[#121212] border border-[#2a2a2a] shadow-[0_0_40px_rgba(99,102,241,0.15)]'
				: 'bg-white border border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)]'
				}`}
		>
			{/* Theme Toggle Button */}
			<button
				onClick={() => setTheme(isDark ? 'light' : 'dark')}
				className={`absolute top-6 right-6 p-2 rounded-lg border transition-all ${isDark
					? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:bg-[#242424]'
					: 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
					}`}
				aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			>
				{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
			</button>

			{/* Title */}
			<div className="text-center mb-8">
				<h1
					className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'
						}`}
				>
					CREATE ACCOUNT
				</h1>
				<p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
					Sign up to get started
				</p>
			</div>

			{/* Error Message */}
			{error && (
				<div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-red-900/20 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'
					}`}>
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				{/* Username Field */}
				<div className="mb-4">
					<label
						htmlFor={`username-${theme}`}
						className={`label mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
					>
						Username
					</label>
					<div className="relative">
						<User
							className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
								}`}
						/>
						<Input
							id={`username-${theme}`}
							type="text"
							placeholder="Enter your username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className={`pl-10 h-11 ${isDark
								? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-indigo-500'
								: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600'
								}`}
						/>
					</div>
				</div>

				{/* Email Field */}
				<div className="mb-4">
					<label
						htmlFor={`email-${theme}`}
						className={`label mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
					>
						Email
					</label>
					<div className="relative">
						<Mail
							className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
								}`}
						/>
						<Input
							id={`email-${theme}`}
							type="email"
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className={`pl-10 h-11 ${isDark
								? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-indigo-500'
								: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600'
								}`}
						/>
					</div>
				</div>

				{/* Password Field */}
				<div className="mb-2">
					<label
						htmlFor={`password-${theme}`}
						className={`label mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
					>
						Password
					</label>
					<div className="relative">
						<Lock
							className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'
								}`}
						/>
						<Input
							id={`password-${theme}`}
							type={showPassword ? 'text' : 'password'}
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className={`pl-10 pr-10 h-11 ${isDark
								? 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-100 placeholder:text-gray-600 focus:border-indigo-500'
								: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600'
								}`}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
								}`}
						>
							{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					<p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
						Min. 8 characters with uppercase and number
					</p>
				</div>
				{/* Role Selection */}
				<div className="mb-4 mt-3">
					<label className={`label mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
						Account Type
					</label>
					<div className="flex gap-3">
						<label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-colors ${selectedRole === 'CLIENT'
							? 'border-indigo-600 bg-indigo-600 text-white'
							: isDark
								? 'border-[#2a2a2a] text-gray-300 hover:bg-[#1a1a1a]'
								: 'border-gray-300 text-gray-700 hover:bg-gray-50'
							}`}>
							<input
								type="radio"
								name="role"
								value="CLIENT"
								checked={selectedRole === 'CLIENT'}
								onChange={() => setSelectedRole('CLIENT')}
								className="hidden"
							/>
							Client
						</label>
						<label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-colors ${selectedRole === 'AGENT'
							? 'border-indigo-600 bg-indigo-600 text-white'
							: isDark
								? 'border-[#2a2a2a] text-gray-300 hover:bg-[#1a1a1a]'
								: 'border-gray-300 text-gray-700 hover:bg-gray-50'
							}`}>
							<input
								type="radio"
								name="role"
								value="AGENT"
								checked={selectedRole === 'AGENT'}
								onChange={() => setSelectedRole('AGENT')}
								className="hidden"
							/>
							Agent
						</label>
					</div>
				</div>
				{/* Sign Up Button */}
				<Button
					type="submit"
					disabled={loading}
					className={`w-full h-11 mt-4 mb-6 font-semibold ${isDark
						? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
						: 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
						}`}
				>
					{loading ? 'Creating account...' : 'Sign Up'}
				</Button>
			</form>

			{/* {isRoleModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
					<div className={`w-full max-w-md rounded-2xl border p-6 ${
						isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-gray-200'
					}`}>
						<h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
							Choisir un rôle
						</h2>
						<p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
							Sélectionnez le type de compte à créer.
						</p>

						<div className="grid grid-cols-2 gap-3 mb-5">
							<button
								type="button"
								onClick={() => setSelectedRole('CLIENT')}
								className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
									selectedRole === 'CLIENT'
										? 'border-indigo-600 bg-indigo-600 text-white'
										: isDark
											? 'border-[#2a2a2a] text-gray-300 hover:bg-[#1a1a1a]'
											: 'border-gray-300 text-gray-700 hover:bg-gray-50'
								}`}
							>
								Client
							</button>
							<button
								type="button"
								onClick={() => setSelectedRole('AGENT')}
								className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
									selectedRole === 'AGENT'
										? 'border-indigo-600 bg-indigo-600 text-white'
										: isDark
											? 'border-[#2a2a2a] text-gray-300 hover:bg-[#1a1a1a]'
											: 'border-gray-300 text-gray-700 hover:bg-gray-50'
								}`}
							>
								Agent
							</button>
						</div>

						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setIsRoleModalOpen(false)}
								className={`rounded-lg px-4 py-2 text-sm font-medium ${
									isDark ? 'text-gray-300 hover:bg-[#1a1a1a]' : 'text-gray-700 hover:bg-gray-100'
								}`}
							>
								Annuler
							</button>
							<button
								type="button"
								onClick={handleCreateAccount}
								disabled={loading}
								className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
							>
								{loading ? 'Création...' : 'Confirmer'}
							</button>
						</div>
					</div>
				</div>
			)} */}

			{/* Separator */}
			<div className="relative mb-6">
				<Separator className={isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} />
				<span
					className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-sm ${isDark ? 'bg-[#121212] text-gray-500' : 'bg-white text-gray-500'
						}`}
				>
					Or continue with
				</span>
			</div>

			{/* Social Auth Buttons */}
			<button
				type="button"
				onClick={handleGoogleRegister}
				className={`flex items-center justify-center gap-2 py-2.5 w-full rounded-lg border transition-all ${isDark
					? 'border-[#2a2a2a] hover:bg-[#1a1a1a] text-gray-300'
					: 'border-gray-300 hover:bg-gray-50 text-gray-700'
					}`}
			>
				<svg width="20" height="20" viewBox="0 0 20 20">
					<path
						d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
						fill="#4285F4"
					/>
					<path
						d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
						fill="#34A853"
					/>
					<path
						d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
						fill="#FBBC05"
					/>
					<path
						d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
						fill="#EA4335"
					/>
				</svg>
				<span className="font-medium">Google</span>
			</button>

			{/* Login Link */}
			<div className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
				Already have an account?{' '}
				<a
					href="/login"
					className={`font-semibold hover:underline ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
						}`}
				>
					Sign in
				</a>
			</div>
		</div>
	);
}
