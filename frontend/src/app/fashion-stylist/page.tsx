'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../hooks/useAuth';
import { useTranslations } from '../../hooks/useTranslations';

interface Message {
  id: string;
  role: 'user' | 'stylist';
  content: string;
  timestamp: Date;
}

export default function FashionStylist() {
  const { user, token, loading } = useAuth();
  const { t, currentLocale } = useTranslations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Welcome message from AI stylist (localized)
  useEffect(() => {
    if (user) {
      setMessages([{
        id: '1',
        role: 'stylist',
        content: t('stylist.welcome', { name: user.name || 'Fashion Icon' }),
        timestamp: new Date()
      }]);
    }
  }, [user, currentLocale]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message:', inputMessage);
      console.log('User:', user?.name);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Try the Next.js API route first, fallback to direct backend
      let response;
      try {
        console.log('Trying Next.js API route...');
        response = await fetch('/api/recommendations/fashion-stylist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: inputMessage,
            userName: user?.name || 'Fashion Icon'
          })
        });
      } catch (apiError) {
        console.log('API route failed, trying direct backend connection:', apiError);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        response = await fetch(`${apiUrl}/api/recommendations/fashion-stylist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: inputMessage,
            userName: user?.name || 'Fashion Icon'
          })
        });
      }

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        const stylistMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'stylist',
          content: data.stylistResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, stylistMessage]);
      } else {
        throw new Error(data.error || 'Failed to get fashion advice');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'stylist',
        content: `Oops! 😅 I ran into a little hiccup: ${errorMsg}\n\nDon't worry though - just give me another moment and try asking again. Sometimes even AI stylists need a quick break! ☕`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show loading screen while checking auth
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 px-4">Getting your stylist ready... ✨</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 px-4">Just a moment while we prepare everything!</p>
        </motion.div>
      </div>
    );
  }

  // Show auth required only after loading is complete
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-4 sm:p-8 bg-white rounded-2xl shadow-xl mx-4"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3 sm:mb-4">Hey there! 👋</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-6 px-2">We'd love to introduce you to your AI Fashion Stylist! Please sign in so we can start styling together. 💫</p>
            <a
              href="/"
              className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm sm:text-base md:text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {t('auth.goHome')}
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation user={user} />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent px-2">{t('stylist.title')}</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            {t('stylist.subtitle')}
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Chat Messages */}
          <div className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p className={`text-xs mt-1 sm:mt-2 ${
                    message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-sm text-gray-600 ml-2">{t('stylist.thinking')}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('stylist.placeholder')}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-shrink-0"
              >
                {isLoading ? '...' : t('stylist.send')}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Questions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center px-2">{t('stylist.examples.title')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              "✨ What colors make me glow?",
              "👗 How do I style this for work?",
              "🔥 What's trending right now?",
              "💼 How do I dress for success?",
              "💎 What accessories complete my look?",
              "📏 How do I look taller and confident?"
            ].map((question, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputMessage(question)}
                className="p-3 sm:p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-white/70 transition-all duration-300 text-left"
              >
                <p className="text-xs sm:text-sm text-gray-700">{question}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
