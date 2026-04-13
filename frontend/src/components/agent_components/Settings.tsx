import {Camera, Globe, Mail, Save, User} from 'lucide-react';
import {useEffect, useMemo, useRef, useState, type ChangeEvent} from 'react';
import {getMyProfile, updateMyProfile, uploadMyAvatar} from '../../services/profile';
import LanguageSelector from '../client_components/LanguageSelector';
import {useTranslation} from 'react-i18next';

type SectionId = 'profile' | 'account' | 'language';

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

const DEFAULT_AGENT_AVATAR = '/assets/avatars/avatar2.png';

function Settings() {
	const {t} = useTranslation('profile');
	const [activeSection, setActiveSection] = useState<SectionId>('profile');
	const [profile, setProfile] = useState<ProfileForm>(profileDefaults);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [savingProfile, setSavingProfile] = useState(false);
	const [feedback, setFeedback] = useState<string>('');
	const [error, setError] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const sections: Array<{id: SectionId; label: string; icon: typeof User}> = [
		{id: 'profile', label: t('sectionProfile'), icon: User},
		{id: 'account', label: t('sectionAccount'), icon: Mail},
		{id: 'language', label: t('sectionLanguage'), icon: Globe},
	];

	const avatarUrl = useMemo(() => {
		if (profile.avatar && profile.avatar.length > 0) return profile.avatar;
		return DEFAULT_AGENT_AVATAR;
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
			} catch (e: any) {
				setError(e?.response?.data?.message ?? t('loadFailed'));
			} finally {
				setLoadingProfile(false);
			}
		};

		loadProfile();
	}, []);

	const clearMessages = () => {
		setFeedback('');
		setError('');
	};

	const getErrorMessage = (e: any, fallback: string) => {
		const message = e?.response?.data?.message;
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
		} catch (e: any) {
			setError(getErrorMessage(e, t('updateFailed')));
		} finally {
			setSavingProfile(false);
		}
	};

	const handleSaveLocalSection = (section: string) => {
		clearMessages();
		setFeedback(t('preferencesSaved', {section}));
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
				window.dispatchEvent(
					new CustomEvent('agent-avatar-updated', {
						detail: {avatar: nextAvatar},
					})
				);
			}

			setFeedback(t('avatarUpdated'));
		} catch (e: any) {
			setError(getErrorMessage(e, t('avatarUploadFailed')));
		} finally {
			event.target.value = '';
		}
	};

	return (
		<div className="flex-1 overflow-auto bg-cream">
			<div className="border-b px-8 py-6 bg-white border-gray-200">
				<h1 className="text-2xl font-bold text-gray-900">{t('settingsTitle')}</h1>
				<p className="text-gray-600 mt-1">{t('settingsSubtitle')}</p>
			</div>

			<div className="flex gap-6 p-8">
				<div className="w-64 space-y-2">
					{sections.map((section) => {
						const Icon = section.icon;
						const isActive = activeSection === section.id;

						return (
							<button
								key={section.id}
								onClick={() => setActiveSection(section.id)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-sky/25 text-navy' : 'text-gray-700 hover:bg-sky/10'
									}`}
							>
								<Icon className="w-5 h-5" />
								<span className="font-medium">{section.label}</span>
							</button>
						);
					})}
				</div>

				<div className="flex-1 max-w-3xl">
					{(feedback || error) && (
						<div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
							{error || feedback}
						</div>
					)}

					{activeSection === 'profile' && (
						<div className="rounded-xl border p-6 bg-white border-gray-200">
							<h2 className="text-xl font-bold mb-6 text-gray-900">{t('profileInfoTitle')}</h2>

							{loadingProfile ? (
								<p className="text-gray-500">{t('loadingProfile')}</p>
							) : (
								<>
									<div className="mb-6 flex items-center gap-4">
										<div className="w-20 h-20 overflow-hidden rounded-full bg-gray-100 shrink-0">
											<img
												src={avatarUrl}
												alt="Avatar"
												className="w-full h-full object-cover object-center"
												onError={(e) => {
													e.currentTarget.src = DEFAULT_AGENT_AVATAR;
												}}
											/>
										</div>
										<button
											type="button"
											onClick={handleAvatarClick}
											className="px-4 py-2 rounded-lg border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
										>
											<Camera className="w-4 h-4 inline-block mr-2" />
											{t('changePhoto')}
										</button>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											onChange={handleAvatarChange}
											className="hidden"
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium mb-2 text-gray-700">{t('firstName')}</label>
											<input
												type="text"
												value={profile.firstName}
												onChange={(e) => handleProfileChange('firstName', e.target.value)}
												className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-[#355872] focus:outline-none focus:ring-2 focus:ring-[#355872]/20"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-2 text-gray-700">{t('lastName')}</label>
											<input
												type="text"
												value={profile.lastName}
												onChange={(e) => handleProfileChange('lastName', e.target.value)}
												className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-[#355872] focus:outline-none focus:ring-2 focus:ring-[#355872]/20"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-2 text-gray-700">{t('username')}</label>
											<input
												type="text"
												value={profile.login}
												onChange={(e) => handleProfileChange('login', e.target.value)}
												className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-[#355872] focus:outline-none focus:ring-2 focus:ring-[#355872]/20"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-2 text-gray-700">{t('email')}</label>
											<input
												type="email"
												value={profile.email}
												onChange={(e) => handleProfileChange('email', e.target.value)}
												className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-[#355872] focus:outline-none focus:ring-2 focus:ring-[#355872]/20"
											/>
										</div>
									</div>

									<div className="flex justify-end mt-6">
										<button
											type="button"
											onClick={handleSaveProfile}
											disabled={savingProfile}
											className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-[#41708f] transition-colors font-medium flex items-center gap-2 disabled:opacity-60"
										>
											<Save className="w-4 h-4" />
											{savingProfile ? t('saving') : t('save')}
										</button>
									</div>
								</>
							)}
						</div>
					)}

					{activeSection === 'account' && (
						<div className="rounded-xl border p-6 bg-white border-gray-200 space-y-6">
							<h2 className="text-xl font-bold text-gray-900">{t('accountSettingsTitle')}</h2>
							<div>
								<label className="block text-sm font-medium mb-2 text-gray-700">{t('emailAddress')}</label>
								<input
									type="email"
									value={profile.email}
									onChange={(e) => handleProfileChange('email', e.target.value)}
									className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-[#355872] focus:outline-none focus:ring-2 focus:ring-[#355872]/20"
								/>
								<p className="text-sm mt-2 text-gray-600">{t('emailUsageHint')}</p>
							</div>

							<div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex items-start justify-between">
								<div>
									<h3 className="font-semibold text-gray-900 mb-1">{t('accountRoleTitle')}</h3>
									<p className="text-sm text-gray-600">{t('accountRoleHint')}</p>
								</div>
								<span className="px-3 py-1 rounded-full text-sm font-medium bg-navy/10 text-navy">
									{profile.role || 'AGENT'}
								</span>
							</div>

							<div className="flex justify-end">
								<button
									type="button"
									onClick={handleSaveProfile}
									disabled={savingProfile}
									className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-[#41708f] transition-colors font-medium flex items-center gap-2 disabled:opacity-60"
								>
									<Save className="w-4 h-4" />
									{savingProfile ? t('saving') : t('saveChanges')}
								</button>
							</div>
						</div>
					)}

					{activeSection === 'language' && (
						<div className="rounded-xl border p-6 bg-white border-gray-200 space-y-4">
							<h2 className="text-xl font-bold text-gray-900">{t('languageTitle')}</h2>
							<div className="max-w-40">
								<LanguageSelector />
							</div>
							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => handleSaveLocalSection(t('sectionLanguage'))}
									className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-[#41708f] transition-colors font-medium flex items-center gap-2"
								>
									<Save className="w-4 h-4" />
									{t('savePreferences')}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Settings;
