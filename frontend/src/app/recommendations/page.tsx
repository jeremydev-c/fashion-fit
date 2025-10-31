'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../hooks/useAuth';
import { useTranslations } from '../../hooks/useTranslations';

interface OutfitItem {
  name: string;
  category: string;
  color: string;
  imageUrl?: string;
}

interface OutfitRecommendation {
  outfitName: string;
  description: string;
  confidence?: number;
  items: OutfitItem[];
  styleNotes?: string;
}

export default function Recommendations() {
  const { user, loading, token } = useAuth();
  const { t } = useTranslations();
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [filters, setFilters] = useState({
    occasion: 'casual',
    weather: 'all-season',
    style: 'casual',
    colorPreference: 'any'
  });
  const [showFilters, setShowFilters] = useState(false);


  const rateOutfit = async (outfitId: string, rating: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/recommendations/outfits/${outfitId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Thanks for the feedback! ⭐\n\nWe've saved your ${rating}-star rating. Your AI stylist is always learning from you to make better suggestions!`);
      } else {
        alert('Oops! 😅 We couldn\'t save your rating right now.\n\n' + (data.error || 'Please try again in a moment!'));
      }
    } catch (error) {
      console.error('Rating error:', error);
      alert('Hmm, something went wrong while saving your rating. 🙈\n\nLet\'s try that again - your feedback helps us improve!');
    }
  };

  const provideFeedback = async (outfitId: string, feedback: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/recommendations/outfits/${outfitId}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Perfect! ✨ We've saved your feedback.\n\nYour AI stylist is taking notes - the more you share, the better we get at matching your style! 🎯`);
      } else {
        alert('Oops! 😅 We couldn\'t save your feedback right now.\n\n' + (data.error || 'Please try again in a moment!'));
      }
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Hmm, something went wrong while saving your feedback. 🙈\n\nYour opinion matters to us - let\'s try that again!');
    }
  };

  const trackWear = async (outfitId: string, occasion: string, weather: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/recommendations/outfits/${outfitId}/wear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ occasion, weather })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Awesome! 📸 We've recorded that you wore this outfit.\n\nYour AI is learning your real-world style preferences - this helps us suggest outfits you'll actually love wearing! 💫`);
      } else {
        alert('Oops! 😅 We couldn\'t track that wear right now.\n\n' + (data.error || 'Please try again in a moment!'));
      }
    } catch (error) {
      console.error('Wear tracking error:', error);
      alert('Hmm, something went wrong while tracking your outfit wear. 🙈\n\nDon\'t worry - let\'s try that again!');
    }
  };


  const generateRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/recommendations/outfit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations);
        
        // Show learning message if AI learned from favorites
        if (data.learnedFromFavorites > 0) {
          console.log(`🎯 AI learned from ${data.learnedFromFavorites} favorite outfits!`);
        }
        
        const recCount = data.recommendations.length;
        alert(`🎉 Amazing! We've created ${recCount} personalized outfit ${recCount === 1 ? 'recommendation' : 'recommendations'} just for you!\n\n${recCount > 0 ? 'Scroll down to see your new style possibilities! ✨' : 'Let\'s build your wardrobe first - upload some items to get started!'}`);
      } else {
        alert('Hmm, we couldn\'t generate recommendations right now. 😅\n\n' + (data.error || 'Make sure you have some items in your wardrobe first, or try again in a moment!'));
      }
    } catch (error) {
      console.error('Recommendation generation error:', error);
      alert('Oops! Something went wrong while creating your recommendations. 🙈\n\nDon\'t worry - this happens sometimes! Make sure your wardrobe has some items, then try again.');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const saveOutfit = async (outfit: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/recommendations/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(outfit)
      });

      const data = await response.json();
      if (data.success) {
        alert('Perfect! ⭐ This outfit has been saved to your favorites!\n\nYou can find it anytime in your favorites section. Great style choices, by the way! 💫');
      } else {
        alert('Oops! 😅 We couldn\'t save that outfit to favorites right now.\n\n' + (data.error || 'Please try again in a moment!'));
      }
    } catch (error) {
      console.error('Save outfit error:', error);
      alert('Hmm, something went wrong while saving to favorites. 🙈\n\nLet\'s try that again - we really want you to be able to save your favorite looks!');
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-800">{t('recommendations.loadingRecommendations')}</h2>
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
            <p className="text-lg text-gray-700 mb-6">We'd love to show you some amazing outfit recommendations! Please sign in so we can create personalized suggestions just for you. 💫</p>
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

      <main className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            {t('recommendations.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">{t('recommendations.subtitle')}</p>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">{t('recommendations.getRecommendations')}</p>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              {t('recommendations.filters.title')}
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              {showFilters ? t('recommendations.filters.clear') : t('recommendations.filters.apply')}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('recommendations.filters.occasion')}</label>
                <select
                  value={filters.occasion}
                  onChange={(e) => setFilters(prev => ({ ...prev, occasion: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="casual">{t('recommendations.occasions.casual')}</option>
                  <option value="work">{t('recommendations.occasions.work')}</option>
                  <option value="formal">{t('recommendations.occasions.formal')}</option>
                  <option value="party">{t('recommendations.occasions.party')}</option>
                  <option value="date">{t('recommendations.occasions.date')}</option>
                  <option value="travel">{t('recommendations.occasions.travel')}</option>
                  <option value="sports">{t('recommendations.occasions.sports')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('recommendations.filters.weather')}</label>
                <select
                  value={filters.weather}
                  onChange={(e) => setFilters(prev => ({ ...prev, weather: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all-season">{t('recommendations.weather.all-season')}</option>
                  <option value="summer">{t('recommendations.weather.summer')}</option>
                  <option value="winter">{t('recommendations.weather.winter')}</option>
                  <option value="spring">{t('recommendations.weather.spring')}</option>
                  <option value="autumn">{t('recommendations.weather.autumn')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('recommendations.filters.style')}</label>
                <select
                  value={filters.style}
                  onChange={(e) => setFilters(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="casual">{t('recommendations.styles.casual')}</option>
                  <option value="formal">{t('recommendations.styles.formal')}</option>
                  <option value="streetwear">{t('recommendations.styles.streetwear')}</option>
                  <option value="minimalist">{t('recommendations.styles.minimalist')}</option>
                  <option value="bohemian">{t('recommendations.styles.bohemian')}</option>
                  <option value="vintage">{t('recommendations.styles.vintage')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('recommendations.filters.colorPreference')}</label>
                <select
                  value={filters.colorPreference}
                  onChange={(e) => setFilters(prev => ({ ...prev, colorPreference: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="any">{t('recommendations.colors.any')}</option>
                  <option value="black">{t('recommendations.colors.black')}</option>
                  <option value="white">{t('recommendations.colors.white')}</option>
                  <option value="red">{t('recommendations.colors.red')}</option>
                  <option value="blue">{t('recommendations.colors.blue')}</option>
                  <option value="green">{t('recommendations.colors.green')}</option>
                  <option value="yellow">{t('recommendations.colors.yellow')}</option>
                  <option value="purple">{t('recommendations.colors.purple')}</option>
                  <option value="pink">{t('recommendations.colors.pink')}</option>
                  <option value="orange">{t('recommendations.colors.orange')}</option>
                  <option value="brown">{t('recommendations.colors.brown')}</option>
                  <option value="gray">{t('recommendations.colors.gray')}</option>
                  <option value="navy">{t('recommendations.colors.navy')}</option>
                  <option value="beige">{t('recommendations.colors.beige')}</option>
                  <option value="maroon">{t('recommendations.colors.maroon')}</option>
                  <option value="olive">{t('recommendations.colors.olive')}</option>
                </select>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={generateRecommendations}
              disabled={loadingRecommendations}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingRecommendations ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('recommendations.loadingRecommendations')}
                </div>
              ) : (
                t('recommendations.getRecommendations')
              )}
            </button>
          </div>
        </motion.div>


        {/* Recommendations Grid */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">
                <span className="text-3xl mr-2">✨</span>
                {t('recommendations.title')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((outfit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{outfit.outfitName}</h3>
                    <p className="text-gray-600 text-sm mb-3">{outfit.description}</p>
                    <div className="flex items-center mb-3">
                      <span className="text-sm text-gray-500">{t('recommendations.outfit.confidence')}:</span>
                      <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(outfit.confidence || 0.8) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 ml-2">{Math.round((outfit.confidence || 0.8) * 100)}%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">{t('recommendations.outfit.items')}:</h4>
                    <div className="space-y-2">
                      {outfit.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm">👕</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{item.category} • {item.color}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {outfit.styleNotes && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">💡 {t('stylist.tips.title')}:</span> {outfit.styleNotes}
                      </p>
                    </div>
                  )}

                  {/* Smart AI Learning Features */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{t('recommendations.outfit.rateOutfit')}:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => rateOutfit(outfit._id || `outfit_${index}`, star)}
                            className="text-2xl hover:scale-110 transition-transform duration-200"
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mb-2">
                      <button
                        onClick={() => provideFeedback(outfit._id || `outfit_${index}`, 'love')}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200 transition-colors"
                      >
                        ❤️ {t('recommendations.outfit.love')}
                      </button>
                      <button
                        onClick={() => provideFeedback(outfit._id || `outfit_${index}`, 'not_my_style')}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        👎 {t('recommendations.outfit.notMyStyle')}
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => trackWear(outfit._id || `outfit_${index}`, filters.occasion, filters.weather)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        👕 {t('recommendations.outfit.woreThis')}
                      </button>
                      <button
                        onClick={() => provideFeedback(outfit._id || `outfit_${index}`, 'like')}
                        className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm hover:bg-green-200 transition-colors"
                      >
                        👍 {t('recommendations.outfit.like')}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => saveOutfit(outfit)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    💾 {t('recommendations.outfit.saveToFavorites')}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}



        {/* Empty State */}
        {recommendations.length === 0 && !loadingRecommendations && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🤖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">{t('recommendations.noRecommendations')}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('recommendations.uploadItems')}</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="text-green-500 mr-1">✓</span>
                {t('recommendations.getRecommendations')}
              </span>
              <span className="flex items-center">
                <span className="text-purple-500 mr-1">✓</span>
                {t('recommendations.title')}
              </span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}