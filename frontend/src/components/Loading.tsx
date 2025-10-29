'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '../hooks/useTranslations';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message }: LoadingProps) {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{message || 'Loading... ✨'}</h2>
        <p className="text-sm text-gray-500">Just a moment, we're getting everything ready for you...</p>
      </motion.div>
    </div>
  );
}
