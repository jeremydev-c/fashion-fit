'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import { useTranslations } from '../hooks/useTranslations';

export default function Home() {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Check for OAuth errors on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'auth_failed') {
      setAuthError(true);
      // Auto-redirect to demo after showing error
      setTimeout(() => {
        const mockToken = 'demo-token-' + Date.now();
        localStorage.setItem('fashionFitToken', mockToken);
        window.location.href = `/dashboard?token=${mockToken}`;
      }, 3000);
    } else if (error === 'duplicate_user') {
      // This means OAuth worked but user already exists - try again
      setTimeout(() => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`;
      }, 2000);
    }
  }, []);

  const handleAuth = () => {
    setIsLoading(true);
    // Redirect to real Google OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  const handleWatchDemo = () => {
    setShowDemo(true);
    setTimeout(() => {
      setShowDemo(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          {t('home.title')}
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleAuth}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          {t('home.signIn')}
        </motion.button>
      </nav>

      {/* OAuth Error Message */}
      {authError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mt-4"
        >
          <div className="flex items-center justify-center">
            <span className="mr-2">⚠️</span>
            <span>Hmm, looks like Google sign-in is taking a quick break! ☕\n\nDon't worry - we're redirecting you to demo mode so you can still explore everything Fashion Fit has to offer! 🚀</span>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
          >
            {t('home.subtitle')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            {t('home.description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button
              onClick={handleAuth}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? '...' : t('home.getStarted')}
            </button>
            <button 
              onClick={handleWatchDemo}
              className="px-8 py-4 border-2 border-purple-600 text-purple-600 text-lg font-semibold rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300 cursor-pointer"
            >
              {t('home.watchDemo')}
            </button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-8 mt-20"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{t('home.features.smartRecommendations.title')}</h3>
              <p className="text-gray-600">{t('home.features.smartRecommendations.description')}</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">👗</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{t('home.features.aiWardrobe.title')}</h3>
              <p className="text-gray-600">{t('home.features.aiWardrobe.description')}</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{t('home.features.styleAnalytics.title')}</h3>
              <p className="text-gray-600">{t('home.features.styleAnalytics.description')}</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Demo Modal */}
      {showDemo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDemo(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-center">🎬 Fashion Fit Demo</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🤖 AI Recommendations</h4>
                <p className="text-sm text-gray-600">Upload photos of your clothes and get instant outfit suggestions!</p>
              </div>
              <div className="bg-gradient-to-r from-pink-100 to-indigo-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">👗 Wardrobe Management</h4>
                <p className="text-sm text-gray-600">Organize your clothes by category, color, and season.</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📱 Style Insights</h4>
                <p className="text-sm text-gray-600">Learn fashion tips and discover new trends.</p>
              </div>
            </div>
            <button
              onClick={() => setShowDemo(false)}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all duration-300"
            >
              Got it! Let's Start
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500">
        <p>&copy; 2024 Fashion Fit. Built with ❤️ by a 15-year-old developer</p>
      </footer>
    </div>
  );
}
