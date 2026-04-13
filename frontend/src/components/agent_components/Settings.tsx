import {Camera, Eye, EyeOff, Globe, Lock, Mail, Save, Shield, User} from 'lucide-react';
import {useEffect, useMemo, useRef, useState, type ChangeEvent} from 'react';
import {getMyProfile, updateMyProfile, uploadMyAvatar} from '../../services/profile';
import LanguageSelector from '../client_components/LanguageSelector';
import {useTranslation} from 'react-i18next';
import Notification from '../client_components/Notification';
import {type ClientNotificationItem} from '../client_components/NotificationView';
import {getSocket} from '../../services/singleton';
import {fetchMyNotifications, readAllMyNotifications, type RawNotification} from '../../services/tickets';

type SectionId = 'profile' | 'account' | 'security' | 'language';

type SystemNotificationCode =
	| 'NEW_CLIENT_TICKET'
	| 'USER_PROFILE_UPDATED'
	| 'USER_LOGGED_IN'
	| 'TICKET_STATUS_UPDATED';

type SystemNotificationEvent = {
	id: number;
	code: SystemNotificationCode;
	createdAt: string;
	readAt?: string | null;
	data?: {
		ticketId?: number;
		ticketTitle?: string;
		userLogin?: string;
		userRole?: 'CLIENT' | 'AGENT' | 'ADMIN';
		fromStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
		toStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
		clientLogin?: string;
	};
};

function mapSystemNotificationText(
	event: SystemNotificationEvent,
	tn: (key: string, options?: Record<string, unknown>) => string,
) {
	const userLogin = event.data?.userLogin ?? tn('unknownUser');
	const roleLabel =
		event.data?.userRole === 'AGENT'
			? tn('roleAgent')
			: event.data?.userRole === 'CLIENT'
				? tn('roleClient')
				: event.data?.userRole ?? '';
	if (event.code === 'NEW_CLIENT_TICKET') {
		return tn('newClientTicketForSupport', {
			ticketId: event.data?.ticketId ?? '-',
			ticketTitle: event.data?.ticketTitle ?? '',
			userLogin,
		});
	}

	if (event.code === 'USER_PROFILE_UPDATED') {
		return tn('userProfileUpdatedForAdmin', {
			userLogin,
			userRole: roleLabel,
		});
	}

	const statusLabel = (status?: string) => {
		if (status === 'OPEN') return tn('statusOpen');
		if (status === 'IN_PROGRESS') return tn('statusInProgress');
		if (status === 'RESOLVED') return tn('statusResolved');
		if (status === 'CLOSED') return tn('statusClosed');
		return status ?? '-';
	};

	if (event.code === 'TICKET_STATUS_UPDATED') {
		const fromStatus = statusLabel(event.data?.fromStatus);
		const toStatus = statusLabel(event.data?.toStatus);

		if (event.data?.clientLogin) {
			return tn('ticketStatusChangedForAdmin', {
				ticketId: event.data?.ticketId ?? '-',
				clientLogin: event.data.clientLogin,
				fromStatus,
				toStatus,
			});
		}

		return tn('ticketStatusChangedForClient', {
			ticketId: event.data?.ticketId ?? '-',
			fromStatus,
			toStatus,
		});
	}
	return tn('userLoggedInForAdmin', {
		userLogin,
		userRole: roleLabel,
	});
}

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

function Settings() {
	const {t, i18n} = useTranslation('profile');
	const {t: tn} = useTranslation('notifications');
	const [activeSection, setActiveSection] = useState<SectionId>('profile');
	const [profile, setProfile] = useState<ProfileForm>(profileDefaults);
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [savingProfile, setSavingProfile] = useState(false);
	const [feedback, setFeedback] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [notifications, setNotifications] = useState<ClientNotificationItem[]>([]);
	const hasNotification = useMemo(
		() => notifications.some((n) => !n.readAt),
		[notifications],
	);

	const handleOpenNotifications = () => {
		setNotifications((prev) =>
			prev.map((n) => (n.readAt ? n : {...n, readAt: new Date().toISOString()})),
		);
		void readAllMyNotifications();
	};

	const [language, setLanguage] = useState(localStorage.getItem('lang') || i18n.language || 'fr');
	const sections: Array<{id: SectionId; label: string; icon: typeof User}> = [
		{id: 'profile', label: t('sectionProfile'), icon: User},
		{id: 'account', label: t('sectionAccount'), icon: Mail},
		{id: 'security', label: t('sectionSecurity'), icon: Shield},
		{id: 'language', label: t('sectionLanguage'), icon: Globe},
	];


	const [securityForm, setSecurityForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
		twoFactorEnabled: false,
	});

	const avatarUrl = useMemo(() => {
		if (profile.avatar && profile.avatar.length > 0) return profile.avatar;
		return 'https://api.dicebear.com/7.x/avataaars/svg?seed=current';
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
	}, [t]);

	useEffect(() => {
		let mounted = true;
		const socket = getSocket();

		const mapFromApi = (row: RawNotification): SystemNotificationEvent => ({
			id: row.id,
			code: row.code,
			createdAt: row.createdAt,
			readAt: row.readAt,
			data: row.payload as SystemNotificationEvent['data'],
		});

		const loadNotifications = async () => {
			try {
				const rows = await fetchMyNotifications();
				if (!mounted) return;

				setNotifications(
					rows.map((row) => {
						const event = mapFromApi(row);
						return {
							id: event.id,
							text: mapSystemNotificationText(event, tn),
							createdAt: event.createdAt,
							readAt: event.readAt ?? null,
						};
					}),
				);
			} catch (error) {
				console.error('Erreur chargement notifications settings:', error);
			}
		};

		void loadNotifications();

		const onSystemNotification = (event: SystemNotificationEvent) => {
			const text = mapSystemNotificationText(event, tn);
			setNotifications((old) =>
				[
					{
						id: event.id,
						text,
						createdAt: event.createdAt,
						readAt: event.readAt ?? null,
					},
					...old,
				].slice(0, 50),
			);
		};

		socket.on('systemNotification', onSystemNotification);
		return () => {
			mounted = false;
			socket.off('systemNotification', onSystemNotification);
		};
	}, [tn]);

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
			<div className="flex items-center justify-between border-b px-4 sm:px-6 lg:px-8 py-5 sm:py-6 bg-white border-gray-200">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('settingsTitle')}</h1>
					<p className="text-gray-600 mt-1">{t('settingsSubtitle')}</p>
				</div>
				<div className="hidden lg:block">
					<Notification
						hasNotification={hasNotification}
						notifications={notifications}
						onOpen={handleOpenNotifications}
					/>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-8">
				<div className="w-full lg:w-64">
					<div className="lg:hidden flex justify-between gap-2 p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
						{sections.map((section) => {
							const Icon = section.icon;
							const isActive = activeSection === section.id;

							return (
								<button
									key={section.id}
									onClick={() => setActiveSection(section.id)}
									className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 ${isActive ? 'bg-sky/25 text-navy' : 'text-gray-500 hover:text-navy hover:bg-sky/10'
										}`}
									title={section.label}
								>
									<Icon className="w-5 h-5" />
								</button>
							);
						})}
					</div>
					<div className="hidden lg:flex lg:flex-col gap-2">
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
											<img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover object-center" />
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

					{activeSection === 'security' && (
						<div className="rounded-xl border p-6 bg-white border-gray-200 space-y-6">
							<h2 className="text-xl font-bold text-gray-900">{t('securityTitle')}</h2>

							<div>
								<label className="block text-sm font-medium mb-2 text-gray-700">{t('currentPassword')}</label>
								<div className="relative">
									<input
										type={showCurrentPassword ? 'text' : 'password'}
										value={securityForm.currentPassword}
										onChange={(e) => setSecurityForm((prev) => ({...prev, currentPassword: e.target.value}))}
										className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-[#355872] focus:outline-none focus:ring-2 focus:ring-[#355872]/20"
									/>
									<button
										type="button"
										onClick={() => setShowCurrentPassword((prev) => !prev)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
									</button>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2 text-gray-700">{t('newPassword')}</label>
								<div className="relative">
									<input
										type={showNewPassword ? 'text' : 'password'}
										value={securityForm.newPassword}
										onChange={(e) => setSecurityForm((prev) => ({...prev, newPassword: e.target.value}))}
										className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-[#355872] focus:outline-none focus:ring-2 focus:ring-[#355872]/20"
									/>
									<button
										type="button"
										onClick={() => setShowNewPassword((prev) => !prev)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
									</button>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2 text-gray-700">{t('confirmNewPassword')}</label>
								<input
									type="password"
									value={securityForm.confirmPassword}
									onChange={(e) => setSecurityForm((prev) => ({...prev, confirmPassword: e.target.value}))}
									className="w-full px-4 py-2 rounded-lg border bg-white border-gray-300 text-gray-900 focus:border-[#355872] focus:outline-none focus:ring-2 focus:ring-[#355872]/20"
								/>
							</div>

							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => handleSaveLocalSection(t('sectionSecurity'))}
									className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
								>
									<Lock className="w-4 h-4" />
									{t('updatePassword')}
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
