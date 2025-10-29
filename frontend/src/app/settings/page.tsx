"use client";

import { useTranslations } from '../../hooks/useTranslations';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../hooks/useAuth';

export default function SettingsPage() {
  const { currentLocale, changeLanguage, t } = useTranslations();
  const { user } = useAuth();
  const locales = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation user={user} />
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow p-6 mt-6">
        <h1 className="text-2xl font-bold mb-2">{t('settings.title')}</h1>
        <p className="text-sm text-gray-600 mb-6">{t('settings.language.description')}</p>

        <div className="space-y-4">
          {/* Language */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold mb-1">{t('settings.language.title')}</h2>
                <p className="text-sm text-gray-600">{t('settings.language.description')}</p>
              </div>
              <select
                value={currentLocale}
                onChange={(e) => changeLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {locales.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 text-sm text-gray-700">
              <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded mr-2">Preview:</span>
              <span>{t('navigation.home')}</span>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h2 className="font-semibold mb-1">{t('settings.privacy.title')}</h2>
            <p className="text-sm text-gray-600">{t('settings.privacy.description')}</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h2 className="font-semibold mb-1">{t('settings.notifications.title')}</h2>
            <p className="text-sm text-gray-600">{t('settings.notifications.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

 