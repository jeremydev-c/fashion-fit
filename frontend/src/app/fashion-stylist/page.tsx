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
  const { user, token } = useAuth();
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
        response = await fetch('http://localhost:5000/api/recommendations/fashion-stylist', {
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
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'stylist',
        content: `Sorry, I encountered an error: ${error.message}. Please make sure the backend server is running on port 5000 and try again!`,
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
            <h2 className="text-3xl font-bold text-red-600 mb-4">{t('auth.required')}</h2>
            <p className="text-lg text-gray-700 mb-6">{t('auth.signInPrompt')}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation user={user} />

      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">{t('stylist.title')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
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
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('stylist.placeholder')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="mt-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{t('stylist.examples.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-white/70 transition-all duration-300 text-left"
              >
                <p className="text-sm text-gray-700">{question}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
