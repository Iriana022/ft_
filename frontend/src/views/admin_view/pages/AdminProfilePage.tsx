import {useEffect, useMemo, useRef, useState, type ChangeEvent} from 'react';
import {Camera, Save} from 'lucide-react';
import {getMyProfile, updateMyProfile, uploadMyAvatar} from '../../../services/profile';
import {useTranslation} from 'react-i18next';
import LanguageSelector from '../../../components/client_components/LanguageSelector';

interface ProfileForm {
	firstName: string;
	lastName: string;
	login: string;
	email: string;
	avatar?: string;
	role?: string;
}

const profileDefaults: ProfileForm = {
	firstName: '',
	lastName: '',
	login: '',
	email: '',
	avatar: '',
	role: '',
};

function AdminProfilePage() {
	const {t} = useTranslation('profile');
	const {t: tc} = useTranslation('common');
	const [profile, setProfile] = useState<ProfileForm>(profileDefaults);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [savingProfile, setSavingProfile] = useState(false);
	const [feedback, setFeedback] = useState<string>('');
	const [error, setError] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const avatarUrl = useMemo(() => {
		if (profile.avatar && profile.avatar.length > 0) return profile.avatar;
		return '/assets/avatars/avatar1.jpg';
	}, [profile.avatar]);

	useEffect(() => {
		const loadProfile = async () => {
			try {
				setLoadingProfile(true);
				const me = await getMyProfile();
				setProfile({
					firstName: me?.firstName ?? '',
					lastName: me?.lastName ?? '',
					login: me?.login ?? '',
					email: me?.email ?? '',
					avatar: me?.avatar ?? '',
					role: me?.role ?? '',
				});
			} catch (e) {
				const err = e as {response?: {data?: {message?: string}}};
				setError(err?.response?.data?.message ?? t('loadFailed'));
			} finally {
				setLoadingProfile(false);
			}
		};

		loadProfile();
	}, [t]);

	const clearMessages = () => {
		setFeedback('');
		setError('');
	};

	const getErrorMessage = (e: unknown, fallback: string) => {
		const err = e as {response?: {data?: {message?: string}}};
		const message = err?.response?.data?.message;
		if (Array.isArray(message)) return message[0] ?? fallback;
		if (typeof message === 'string') return message;
		return fallback;
	};

	const handleProfileChange = (field: keyof ProfileForm, value: string) => {
		clearMessages();
		setProfile((prev) => ({...prev, [field]: value}));
	};

	const handleSaveProfile = async () => {
		try {
			setSavingProfile(true);
			clearMessages();
			await updateMyProfile({
				firstName: profile.firstName,
				lastName: profile.lastName,
				login: profile.login,
				email: profile.email,
			});
			setFeedback(t('updatedSuccess'));
		} catch (e) {
			setError(getErrorMessage(e, t('updateFailed')));
		} finally {
			setSavingProfile(false);
		}
	};

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			clearMessages();
			const updated = await uploadMyAvatar(file);
			const nextAvatar = updated?.avatar ?? '';

			if (nextAvatar) {
				setProfile((prev) => ({...prev, avatar: nextAvatar}));
				localStorage.setItem('user_avatar', nextAvatar);
			}

			setFeedback(t('avatarUpdated'));
		} catch (e) {
			setError(getErrorMessage(e, t('avatarUploadFailed')));
		} finally {
			event.target.value = '';
		}
	};

	return (
		<div className="p-6 md:p-8 max-w-4xl mx-auto">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900">{t('profilePageTitle')}</h1>
				<p className="text-gray-600 mt-1">{t('profileInfoTitle')}</p>
			</div>

			{(feedback || error) && (
				<div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
					{error || feedback}
				</div>
			)}

			{loadingProfile ? (
				<div className="flex items-center justify-center py-12">
					<span className="loading loading-spinner loading-lg text-navy"></span>
				</div>
			) : (
				<div className="rounded-xl border bg-white border-gray-200 p-6 md:p-8">
					<div className="mb-8 flex flex-col sm:flex-row items-center gap-6">
						<div className="relative">
							<img
								src={avatarUrl}
								alt={tc('userAvatar')}
								className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-100"
							/>
							<button
								type="button"
								onClick={handleAvatarClick}
								className="absolute bottom-0 right-0 p-2 bg-navy text-white rounded-full hover:bg-[#41708f] transition-colors shadow-lg"
							>
								<Camera className="w-4 h-4" />
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleAvatarChange}
								className="hidden"
							/>
						</div>
						<div className="text-center sm:text-left">
							<h2 className="text-xl font-semibold text-gray-900">{profile.login || 'Admin'}</h2>
							<p className="text-gray-500 text-sm mt-1">{profile.role === 'ADMIN' ? 'Administrator' : profile.role}</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium mb-2 text-gray-700">{t('username')}</label>
							<input
								type="text"
								value={profile.login}
								onChange={(e) => handleProfileChange('login', e.target.value)}
								className="w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-900 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-colors"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2 text-gray-700">{t('email')}</label>
							<input
								type="email"
								value={profile.email}
								onChange={(e) => handleProfileChange('email', e.target.value)}
								className="w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-900 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-colors"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2 text-gray-700">{t('firstName')}</label>
							<input
								type="text"
								value={profile.firstName}
								onChange={(e) => handleProfileChange('firstName', e.target.value)}
								className="w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-900 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-colors"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2 text-gray-700">{t('lastName')}</label>
							<input
								type="text"
								value={profile.lastName}
								onChange={(e) => handleProfileChange('lastName', e.target.value)}
								className="w-full px-4 py-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-900 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20 transition-colors"
							/>
						</div>
					</div>

					<div className="mt-8 pt-6 border-t border-gray-100">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">{t('languageTitle')}</h3>
						<div className="max-w-[150px]">
							<LanguageSelector />
						</div>
					</div>

					<div className="flex justify-end mt-6">
						<button
							type="button"
							onClick={handleSaveProfile}
							disabled={savingProfile}
							className="px-6 py-3 bg-navy text-white rounded-lg hover:bg-[#41708f] transition-colors font-medium flex items-center gap-2 disabled:opacity-60"
						>
							<Save className="w-5 h-5" />
							{savingProfile ? t('saving') : t('save')}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default AdminProfilePage;
