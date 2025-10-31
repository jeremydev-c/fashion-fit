'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '../../components/Navigation';
import { useTranslations } from '../../hooks/useTranslations';
import { useAuth, User } from '../../hooks/useAuth';

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user, loading, login } = useAuth();
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // If there's a token in URL (from OAuth callback), use it to login
    if (token) {
      login(token);
    }
  }, [token, login]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800">Getting your dashboard ready... ✨</h2>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-white rounded-2xl shadow-xl"
          >
            <h2 className="text-3xl font-bold text-red-600 mb-4">Hey there! 👋</h2>
            <p className="text-lg text-gray-700 mb-6">We'd love to show you your dashboard! Please sign in so we can personalize your fashion journey.</p>
            <a
              href="/"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Go to Home
            </a>
          </motion.div>
      </div>
    </div>
  );
  
  // TypeScript guard: user is definitely User here
  const currentUser = user as User;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation user={currentUser} />

      {/* Dashboard Content */}
      <main className="container mx-auto px-6 py-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                    {t('common.welcome', { name: currentUser.name || 'Fashion Icon' })}
                  </h1>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
                    🎉 {t('common.subtitle')}
                  </p>
                  <p className="text-lg text-gray-500 max-w-xl mx-auto">
                    {t('common.description')}
                  </p>
                </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-8"
        >
                  <a href="/wardrobe" className="block">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">👗</span>
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-gray-800">{t('home.features.aiWardrobe.title')}</h3>
                      <p className="text-gray-600 mb-6">{t('home.features.aiWardrobe.description')}</p>
                      <div className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-center font-semibold group-hover:shadow-lg transition-all duration-300">
                        {t('home.cta.button')}
                      </div>
                    </div>
                  </a>

          <a href="/recommendations" className="block">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">{t('home.features.smartRecommendations.title')}</h3>
              <p className="text-gray-600 mb-6">{t('home.features.smartRecommendations.description')}</p>
              <div className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-center font-semibold group-hover:shadow-lg transition-all duration-300">
                {t('recommendations.title')}
              </div>
            </div>
          </a>

                  <a href="/fashion-stylist" className="block">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">👗</span>
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-gray-800">{t('home.features.fashionStylist.title')}</h3>
                      <p className="text-gray-600 mb-6">{t('home.features.fashionStylist.description')}</p>
                      <div className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-center font-semibold group-hover:shadow-lg transition-all duration-300">
                        {t('stylist.title')}
                      </div>
                    </div>
                  </a>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">👗</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">0</h3>
            <p className="text-gray-600 font-medium">{t('dashboard.stats.fashionPieces')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('dashboard.stats.ready')}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🤖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">∞</h3>
            <p className="text-gray-600 font-medium">{t('dashboard.stats.aiCombinations')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('dashboard.stats.endless')}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">⭐</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">10/10</h3>
            <p className="text-gray-600 font-medium">{t('dashboard.stats.stylePotential')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('dashboard.stats.amazing')}</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">100%</h3>
            <p className="text-gray-600 font-medium">{t('dashboard.stats.fashionReady')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('dashboard.stats.letsGo')}</p>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-12"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-2">🎉</span>
            {t('dashboard.activity.title')}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-sm">✨</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{t('dashboard.activity.welcome')}</p>
                <p className="text-xs text-gray-500">{t('dashboard.activity.revolution')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-indigo-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-sm">📧</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{t('dashboard.activity.welcomeDelivered')}</p>
                <p className="text-xs text-gray-500">{t('dashboard.activity.checkEmail')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-sm">🎯</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{t('dashboard.activity.profileReady')}</p>
                <p className="text-xs text-gray-500">{t('dashboard.activity.analyzing')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-12"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-2">⚡</span>
            {t('dashboard.actions.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105 group">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📸</span>
              <div className="text-left">
                <p className="font-medium text-gray-800">{t('dashboard.actions.uploadTitle')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.actions.uploadDesc')}</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-100 to-indigo-100 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105 group">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🤖</span>
              <div className="text-left">
                <p className="font-medium text-gray-800">{t('dashboard.actions.magicTitle')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.actions.magicDesc')}</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105 group">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📊</span>
              <div className="text-left">
                <p className="font-medium text-gray-800">{t('dashboard.actions.insightsTitle')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.actions.insightsDesc')}</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Weather & Style Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">🌤️</span>
              {t('dashboard.weather.title')}
            </h3>
            <div className="text-center">
              <div className="text-4xl mb-2">☀️</div>
              <p className="text-2xl font-bold text-gray-800">24°C</p>
              <p className="text-gray-600 font-medium">{t('dashboard.weather.subtitle')}</p>
              <p className="text-sm text-gray-500 mt-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-2">
                ✨ {t('dashboard.weather.tip')}
              </p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              {t('dashboard.style.title')}
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700 font-medium">{t('dashboard.style.quote')}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2">
                <span className="text-lg">💎</span>
                <span className="font-medium">{t('dashboard.style.badge')}</span>
              </div>
              <div className="text-xs text-gray-400 mt-2">{t('dashboard.style.note')}</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
