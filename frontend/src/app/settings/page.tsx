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
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow p-4 sm:p-6 mt-4 sm:mt-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 px-2">{t('settings.title')}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 px-2">{t('settings.language.description')}</p>

          <div className="space-y-3 sm:space-y-4">
            {/* Language */}
            <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <h2 className="text-sm sm:text-base font-semibold mb-1">{t('settings.language.title')}</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{t('settings.language.description')}</p>
                </div>
                <select
                  value={currentLocale}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white min-w-[140px]"
                >
                  {locales.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 text-xs sm:text-sm text-gray-700">
                <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded mr-2">Preview:</span>
                <span>{t('navigation.home')}</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <h2 className="text-sm sm:text-base font-semibold mb-1">{t('settings.privacy.title')}</h2>
              <p className="text-xs sm:text-sm text-gray-600">{t('settings.privacy.description')}</p>
            </div>
            <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
              <h2 className="text-sm sm:text-base font-semibold mb-1">{t('settings.notifications.title')}</h2>
              <p className="text-xs sm:text-sm text-gray-600">{t('settings.notifications.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

 