'use client';

import { useEffect, useState } from 'react';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../hooks/useAuth';

interface FavoriteItem {
  _id: string;
  name: string;
  category: string;
  color?: string;
  imageUrl?: string;
  tags?: string[];
}

interface FavoriteOutfit {
  _id: string;
  name: string;
  items: FavoriteItem[];
  aiRecommendationData?: {
    description?: string;
    style?: string;
    confidence?: number;
  };
  createdAt: string;
}

export default function FavoritesPage() {
  const { user, token, loading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteOutfit[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;
      try {
        setIsFetching(true);
        setError(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/recommendations/outfits/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch favorites (${res.status})`);
        }
        const data = await res.json();
        setFavorites(data.favorites || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load favorites');
      } finally {
        setIsFetching(false);
      }
    };

    if (user && token) {
      fetchFavorites();
    }
  }, [user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800">Loading your favorites...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh] px-6">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-red-600 mb-4">Authentication Required</h2>
            <p className="text-lg text-gray-700 mb-6">Please sign in to view your favorite outfits.</p>
            <a href="/" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105">Go to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation user={user} />

      <main className="container mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">Your Favorite Outfits</h1>
          <p className="text-gray-600 mt-2">Saved looks curated by your AI stylist</p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
        )}

        {isFetching ? (
          <div className="text-center text-gray-600">Fetching favorites...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center text-gray-600">No favorites yet. Save outfits from AI Recommendations to see them here.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((outfit) => (
              <div key={outfit._id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{outfit.name}</h3>
                    {outfit.aiRecommendationData?.confidence !== undefined && (
                      <p className="text-xs text-gray-500">Confidence: {(outfit.aiRecommendationData.confidence * 100).toFixed(0)}%</p>
                    )}
                  </div>
                  <span className="text-xl">⭐</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {outfit.items.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-20 object-cover rounded" />
                      ) : (
                        <div className="w-full h-20 flex items-center justify-center bg-gray-50 rounded text-gray-400 text-sm">No image</div>
                      )}
                      <p className="mt-2 text-xs font-medium text-gray-700 truncate" title={item.name}>{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.category}{item.color ? ` • ${item.color}` : ''}</p>
                    </div>
                  ))}
                </div>
                {outfit.aiRecommendationData?.description && (
                  <p className="mt-3 text-sm text-gray-600">{outfit.aiRecommendationData.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


