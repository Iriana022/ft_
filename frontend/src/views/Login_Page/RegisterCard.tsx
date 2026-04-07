import {Mail, Lock, Eye, EyeOff, User} from 'lucide-react';
import {useState, type FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '../../components/login_components/button';
import {Input} from '../../components/login_components/input';
import Separator from '../../components/login_components/Separator';
import api from '../../services/api';
import GoogleButton from '../../components/login_components/GoogleButton';

export function RegisterCard() {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'AGENT'>('CLIENT');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await handleCreateAccount();
	};

	const handleGoogleRegister = () => {
		window.location.href = 'https://localhost:8443/api/auth/google/login?flow=register';
	};

	const handleCreateAccount = async () => {
		setError('');
		setLoading(true);

		try {
			await api.post('/auth/register', {
				email,
				password,
				login: username,
				role: selectedRole,
			});

			navigate('/login', {
				state: {message: 'Inscription réussie, veuillez vous connecter !'}
			});

		} catch (err: any) {
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
		<div className="w-full max-w-md p-8 rounded-2xl bg-white border border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)]">

			{/* Title */}
			<div className="text-center mb-8">
				<h1 className="text-2xl font-bold mb-2 text-gray-900">
					CREATE ACCOUNT
				</h1>
				<p className="text-gray-600">
					Sign up to get started
				</p>
			</div>

			{/* Error */}
			{error && (
				<div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit}>

				{/* Username */}
				<div className="mb-4">
					<label className="block mb-2 text-gray-700">Username</label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<Input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="pl-10 h-11 bg-white"
							placeholder="Enter your username"
						/>
					</div>
				</div>

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
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
						>
							{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					<p className="text-xs mt-1 text-gray-500">
						Min. 8 characters with uppercase and number
					</p>
				</div>

				{/* Role */}
				<div className="mb-4 mt-3">
					<label className="block mb-2 text-gray-700">Account Type</label>

					<div className="flex gap-3">
						{['CLIENT', 'AGENT'].map((role) => (
							<label
								key={role}
								className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-colors
									${selectedRole === role
										? 'border-indigo-600 bg-indigo-600 text-white'
										: 'border-gray-300 text-gray-700 hover:bg-gray-50'
									}`}
							>
								<input
									type="radio"
									name="role"
									value={role}
									checked={selectedRole === role}
									onChange={() => setSelectedRole(role as 'CLIENT' | 'AGENT')}
									className="hidden"
								/>
								{role === 'CLIENT' ? 'Client' : 'Agent'}
							</label>
						))}
					</div>
				</div>

				{/* Submit */}
				<Button
					type="submit"
					disabled={loading}
					className="w-full h-11 mt-4 mb-6 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
				>
					{loading ? 'Creating account...' : 'Sign Up'}
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
			<GoogleButton handleClick={handleGoogleRegister} label="Google" />

			{/* Login */}
			<div className="text-center text-sm mt-6 text-gray-600">
				Already have an account?{' '}
				<a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
					Sign in
				</a>
			</div>
		</div>
	);
}
