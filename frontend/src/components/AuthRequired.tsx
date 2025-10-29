'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '../hooks/useTranslations';

interface AuthRequiredProps {
  message?: string;
}

export default function AuthRequired({ message }: AuthRequiredProps) {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-2xl shadow-xl"
        >
          <h2 className="text-3xl font-bold text-red-600 mb-4">Hey there! 👋</h2>
          <p className="text-lg text-gray-700 mb-6">{message || "We'd love to show you this feature! Please sign in so we can personalize your experience. 🎨"}</p>
          <a
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {t('auth.goHome')}
          </a>
        </motion.div>
      </div>
    </div>
  );
}
