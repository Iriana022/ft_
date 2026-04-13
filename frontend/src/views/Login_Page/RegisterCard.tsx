import {useState, type FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '../../components/login_components/button';
import Separator from '../../components/login_components/Separator';
import api from '../../services/api';
import GoogleButton from '../../components/login_components/GoogleButton';
import {Link} from 'react-router-dom';
import {UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, BriefcaseIcon} from '@heroicons/react/24/outline';
import {useTranslation} from 'react-i18next';

export function RegisterCard() {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'AGENT'>('CLIENT');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const {t} = useTranslation("auth");

	const navigate = useNavigate();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
			const response = await api.post('/auth/register', {
				email,
				password,
				login: username,
				role: selectedRole,
			});

			if (response.data?.ok === false) {
				const backendMessage = response.data?.message;
				if (Array.isArray(backendMessage)) {
					setError(backendMessage[0]);
				} else {
					setError(backendMessage || "Erreur lors de l'inscription");
				}
				return;
			}

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
		<div className="w-full max-w-md mt-20 p-8 rounded-2xl bg-gray-50 border border-gray-200 shadow-[0_4px_40px_rgba(0,0,0,0.08)]">

			{/* Title */}
			<div className="text-center mb-8 flex flex-col gap-5">
				<div>
					<h1 className="text-xl font-semibold font-bold mb-1 text-navy">
						{t("register")}
					</h1>
					<p className="text-sm text-gray-600">
						{t("registerDescription")}
					</p>
				</div>
			</div>

			{
				error && (
					<div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600">
						{error}
					</div>
				)
			}

			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label className="text-sm md:text-base block mb-2 text-gray-700">{t("username")}</label>
					<div className="relative">
						<UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
						<input
							type="text"
							data-slot="input"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="pl-10 h-11 w-full rounded-lg border border-gray-300
								bg-cream/50 text-xs md:text-sm text-gray-800 placeholder-gray-500
								focus:outline-none focus:ring-2 focus:ring-navy focus:ring-opacity-50
								focus:border-navy/81
								hover:border-gray-399
								disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
								transition-colors duration-200 ease-in-out"
							placeholder={t("usernamePlaceholder")}
							required
						/>
					</div>
				</div>

				<div className="mb-4">
					<label className="text-sm md:text-base block mb-2 text-gray-700">{t("email")}</label>
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
							placeholder={t("emailPlaceholder")}
							required
						/>
					</div>
				</div>

				<div className="mb-2">
					<label className="text-sm md:text-base block mb-2 text-gray-700">{t("password")}</label>
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
							placeholder={t("passwordPlaceholder")}
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
					<p className="text-xs mt-1 text-gray-500">
						{t("passwordRule")}
					</p>
				</div>

				<div className="mb-4 mt-3">
					<label className="text-sm md:text-base block mb-2 text-gray-700">{t("accountType")}</label>

					<div className="flex w-full gap-3">
						{['CLIENT', 'AGENT'].map((role) => {
							const isSelected = selectedRole === role;

							return (
								<label
									key={role}
									className={`
						flex w-1/2 items-center justify-center gap-2 cursor-pointer
						px-2 md:px-4 py-2 md:py-3 rounded-lg border text-sm font-medium
						transition-all duration-200
						${isSelected
											? 'border-navy text-navy ring-1 ring-navy/20'
											: 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
										}
					`}
								>
									<input
										type="radio"
										name="role"
										value={role}
										checked={isSelected}
										onChange={() => setSelectedRole(role as 'CLIENT' | 'AGENT')}
										className="hidden"
									/>

									{role === 'CLIENT' ? (
										<>
											<UserIcon className="w-5 h-5 text-blue-500" />
											{t("client")}
										</>
									) : (
										<>
											<BriefcaseIcon className="w-5 h-5 text-green-500" />
											{t("agent")}
										</>
									)}
								</label>
							);
						})}
					</div>
				</div>

				{/* Submit */}
				<Button
					type="submit"
					disabled={loading}
					className="w-full h-11 mt-4 mb-6 font-semibold bg-navy hover:bg-[#2e4f70] transition-colors text-white disabled:opacity-50"
				>
					{loading ? t("accountCreation") + '...' : t("register")}
				</Button>
			</form >

			{/* Separator */}
			< div className="relative mb-6" >
				<Separator />
				<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs md:text-sm bg-gray-50 text-gray-500">
					{t("orContinueWith")}
				</span>
			</div >

			{/* Google */}
			< GoogleButton handleClick={handleGoogleRegister} label="Google" />

			{/* Login */}
			< div className="text-center text-sm mt-6 text-gray-600" >
				{t("alreadyHaveAccount")} ?{' '}
				<Link to="/login" className="font-semibold text-navy hover:underline" >
					{t("login")}
				</Link >
			</div >
		</div >
	);
}
