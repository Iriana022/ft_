import { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Shield,
  Palette,
  Save,
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { UserRole } from '../types';

interface SettingsPageProps {
  currentRole: UserRole;
}

export function SettingsPage({ currentRole }: SettingsPageProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    login: 'j.dupont',
    phone: '+33 6 12 34 56 78',
    bio: 'Agent de support passionné par l\'aide aux clients.'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewTicket: true,
    emailTicketUpdate: true,
    emailTicketResolved: false,
    pushNewTicket: true,
    pushTicketUpdate: false,
    pushTicketResolved: true,
    dailyDigest: true,
    weeklyReport: false
  });

  const [preferences, setPreferences] = useState({
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    ticketsPerPage: '20',
    defaultView: 'list'
  });

  const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'account', label: 'Compte', icon: Mail },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Préférences', icon: Palette },
    { id: 'language', label: 'Langue & Région', icon: Globe }
  ];

  const handleSave = (section: string) => {
    console.log(`Sauvegarde des données de la section: ${section}`);
    // Logique de sauvegarde
  };

  return (
    <div className={`flex-1 overflow-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b px-8 py-6 ${
        isDark ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              Paramètres
            </h1>
            <p className={isDark ? 'text-gray-400 mt-1' : 'text-gray-600 mt-1'}>
              Gérez vos préférences et paramètres de compte
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6 p-8">
        {/* Sidebar Navigation */}
        <div className="w-64 space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? isDark
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'bg-indigo-50 text-indigo-600'
                    : isDark
                      ? 'text-gray-400 hover:bg-[#1a1a1a]'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className={`rounded-xl border p-6 ${
              isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Informations du profil
              </h2>

              {/* Avatar */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Photo de profil
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=current"
                    alt="Profile"
                    className="w-20 h-20 rounded-full"
                  />
                  <button className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    isDark
                      ? 'bg-[#121212] border-[#2a2a2a] text-gray-300 hover:bg-[#242424]'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <Camera className="w-4 h-4" />
                    Changer la photo
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Nom
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={profileData.login}
                    onChange={(e) => setProfileData({ ...profileData, login: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border resize-none transition-colors ${
                      isDark
                        ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleSave('profile')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          )}

          {/* Account Section */}
          {activeSection === 'account' && (
            <div className={`rounded-xl border p-6 ${
              isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Paramètres du compte
              </h2>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  />
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    Cette adresse sera utilisée pour les notifications et la connexion
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-[#121212] border border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        Rôle du compte
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Vous êtes actuellement: <span className="font-medium capitalize">{currentRole.toLowerCase()}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isDark ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {currentRole}
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  isDark ? 'bg-red-600/5 border-red-600/20' : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                    Zone dangereuse
                  </h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Une fois supprimé, votre compte ne pourra pas être récupéré
                  </p>
                  <button className={`px-4 py-2 rounded-lg border-2 transition-colors font-medium ${
                    isDark
                      ? 'border-red-600/50 text-red-400 hover:bg-red-600/10'
                      : 'border-red-300 text-red-700 hover:bg-red-100'
                  }`}>
                    Supprimer mon compte
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleSave('account')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className={`rounded-xl border p-6 ${
              isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Sécurité
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    Changer le mot de passe
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className={`w-full px-4 py-2 pr-10 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                            isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className={`w-full px-4 py-2 pr-10 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                          } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                            isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                          isDark
                            ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-[#121212] border border-[#2a2a2a]' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <Shield className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <h4 className={`font-semibold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        Authentification à deux facteurs
                      </h4>
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Ajoutez une couche de sécurité supplémentaire à votre compte
                      </p>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                        Activer 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleSave('security')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Mettre à jour le mot de passe
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className={`rounded-xl border p-6 ${
              isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Notifications
              </h2>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    Notifications par email
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNewTicket', label: 'Nouveau ticket créé' },
                      { key: 'emailTicketUpdate', label: 'Mise à jour d\'un ticket' },
                      { key: 'emailTicketResolved', label: 'Ticket résolu' },
                      { key: 'dailyDigest', label: 'Résumé quotidien' },
                      { key: 'weeklyReport', label: 'Rapport hebdomadaire' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between cursor-pointer">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {item.label}
                        </span>
                        <button
                          onClick={() => setNotificationSettings({
                            ...notificationSettings,
                            [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings[item.key as keyof typeof notificationSettings]
                              ? 'bg-indigo-600'
                              : isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings[item.key as keyof typeof notificationSettings]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    Notifications push
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'pushNewTicket', label: 'Nouveau ticket créé' },
                      { key: 'pushTicketUpdate', label: 'Mise à jour d\'un ticket' },
                      { key: 'pushTicketResolved', label: 'Ticket résolu' }
                    ].map((item) => (
                      <label key={item.key} className="flex items-center justify-between cursor-pointer">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                          {item.label}
                        </span>
                        <button
                          onClick={() => setNotificationSettings({
                            ...notificationSettings,
                            [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings[item.key as keyof typeof notificationSettings]
                              ? 'bg-indigo-600'
                              : isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings[item.key as keyof typeof notificationSettings]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleSave('notifications')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className={`rounded-xl border p-6 ${
              isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Préférences d'affichage
              </h2>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Tickets par page
                  </label>
                  <select
                    value={preferences.ticketsPerPage}
                    onChange={(e) => setPreferences({ ...preferences, ticketsPerPage: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Vue par défaut
                  </label>
                  <select
                    value={preferences.defaultView}
                    onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  >
                    <option value="list">Liste</option>
                    <option value="grid">Grille</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>

                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-[#121212] border border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                        Thème de l'interface
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Actuellement en mode {theme === 'dark' ? 'sombre' : 'clair'}
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleSave('preferences')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}

          {/* Language & Region Section */}
          {activeSection === 'language' && (
            <div className={`rounded-xl border p-6 ${
              isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                Langue et région
              </h2>

              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Langue de l'interface
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Fuseau horaire
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  >
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="America/New_York">America/New York (GMT-5)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Format de date
                  </label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-[#121212] border-[#2a2a2a] text-gray-100 focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-600'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => handleSave('language')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer les préférences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
