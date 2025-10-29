'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTranslations } from '../hooks/useTranslations';

interface NavigationProps {
  user?: {
    name: string;
    email: string;
    profilePicture?: string;
  } | null;
}

export default function Navigation({ user }: NavigationProps) {
  const { t } = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  // Close user menu on outside click or Esc
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              {t('home.title')}
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  {t('navigation.home')}
                </Link>
                <Link 
                  href="/wardrobe" 
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  {t('navigation.wardrobe')}
                </Link>
                <Link 
                  href="/recommendations" 
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  {t('navigation.recommendations')}
                </Link>
                <Link 
                  href="/fashion-stylist" 
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  {t('navigation.stylist')}
                </Link>
                
                {/* User Profile Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full px-2 py-1"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    {user.profilePicture && (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full shadow-md"
                      />
                    )}
                    <span className="text-gray-700 font-medium">{user.name}</span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.853a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50" onClick={() => setIsUserMenuOpen(false)}>
                          {t('navigation.profile')}
                        </Link>
                        <Link href="/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50" onClick={() => setIsUserMenuOpen(false)}>
                          {t('navigation.favorites')}
                        </Link>
                        <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50" onClick={() => setIsUserMenuOpen(false)}>
                          {t('navigation.settings')}
                        </Link>
                        <button
                          onClick={() => { setIsUserMenuOpen(false); handleSignOut(); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          {t('navigation.signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link 
                href="/" 
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all duration-300"
              >
                {t('navigation.signIn')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            {user ? (
              <div className="space-y-4">
                <Link 
                  href="/dashboard" 
                  className="block text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.home')}
                </Link>
                <Link 
                  href="/wardrobe" 
                  className="block text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.wardrobe')}
                </Link>
                <Link 
                  href="/recommendations" 
                  className="block text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.recommendations')}
                </Link>
                <Link 
                  href="/fashion-stylist" 
                  className="block text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('navigation.stylist')}
                </Link>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-3">
                    {user.profilePicture && (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full shadow-md"
                      />
                    )}
                    <span className="text-gray-700 font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full hover:shadow-lg transition-all duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                href="/" 
                className="block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all duration-300 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.signIn')}
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
