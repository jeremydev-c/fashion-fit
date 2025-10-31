'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/Loading';
import AuthRequired from '../../components/AuthRequired';
import SmartCamera from '../../components/SmartCamera';

import { useTranslations } from '../../hooks/useTranslations';

export default function Wardrobe() {
  const { user, loading, token } = useAuth();
  const { t } = useTranslations();
  const enableSmartCamera = process.env.NEXT_PUBLIC_ENABLE_SMART_CAMERA === 'true';
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSmartCamera, setShowSmartCamera] = useState(false);
  const [uploadForm, setUploadForm] = useState<{
    name: string;
    category: string;
    color: string;
    brand: string;
    image: File | null;
  }>({
    name: '',
    category: '',
    color: '',
    brand: '',
    image: null
  });

  useEffect(() => {
    if (token) {
      fetchWardrobeItems(token);
    }
  }, [token]);

  const fetchWardrobeItems = async (token: string | null) => {
    if (!token) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/wardrobe`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWardrobeItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch wardrobe items:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, image: file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.image) {
      alert('Please select an image');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('fashionFitToken');

    const formData = new FormData();
    formData.append('image', uploadForm.image);
    formData.append('name', uploadForm.name);
    formData.append('category', uploadForm.category);
    formData.append('color', uploadForm.color);
    formData.append('brand', uploadForm.brand);

    try {
      const response = await fetch('http://localhost:5000/api/wardrobe/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh wardrobe items
        await fetchWardrobeItems(token);
        setShowUploadModal(false);
        setUploadForm({ name: '', category: '', color: '', brand: '', image: null });
        
        // Show simple success message
        alert('🎉 Awesome! Your item has been added to your wardrobe!\n\nWe\'ve analyzed it with AI and added smart tags to help you stay organized. Ready to create some stylish outfits?');
      } else {
        alert('Oops! We couldn\'t upload your item right now. 🙈\n\n' + (data.error || 'Please try again in a moment!'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Hmm, something went wrong while uploading. 😅\n\nDon\'t worry, your item is safe! Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const editItem = (item) => {
    const newCategory = prompt(`Current category: ${item.category}\n\nEnter new category (top, bottom, dress, shoes, accessories, outerwear, underwear):`, item.category);
    if (newCategory && newCategory !== item.category) {
      updateItemCategory(item._id, newCategory);
    }
  };

  const updateItemCategory = async (itemId, newCategory) => {
    const token = localStorage.getItem('fashionFitToken');
    if (!token) return; // No point trying without token
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/wardrobe/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category: newCategory })
      });

      const data = await response.json();
      if (data.success) {
        await fetchWardrobeItems(token);
        alert('Perfect! ✨ Your item category has been updated.\n\nYour wardrobe just got a bit more organized!');
      } else {
        alert('Oh no! We couldn\'t update that right now. 🙈\n\n' + (data.error || 'Please try again in a moment!'));
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Oops! Something went wrong while updating. 😅\n\nLet\'s try that again - sometimes these things need a second attempt!');
    }
  };

  const deleteItem = async (itemId) => {
    if (!confirm('Wait! 👋\n\nAre you sure you want to remove this item from your wardrobe? This can\'t be undone, but we totally get it if it\'s time to say goodbye!')) return;
    
    const token = localStorage.getItem('fashionFitToken');
    if (!token) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/wardrobe/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchWardrobeItems(token);
        alert('Done! 🗑️ Your item has been removed.\n\nDon\'t worry, your wardrobe is still amazing without it!');
      } else {
        alert('Hmm, we couldn\'t remove that item right now. 🙈\n\n' + (data.error || 'Please try again in a moment!'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Oops! Something went wrong while trying to delete. 😅\n\nLet\'s try that again - technical hiccups happen to the best of us!');
    }
  };

  // Helper function to upload a single item
  const uploadItem = async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    // Use filename as default name (remove extension)
    formData.append('name', imageFile.name.split('.')[0]);
    formData.append('category', 'auto-detected'); // AI will detect these
    formData.append('color', 'auto-detected');
    formData.append('brand', 'auto-detected');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/wardrobe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` // JWT token for auth
      },
      body: formData // multipart/form-data
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  };

  const handleSmartPhotos = async (photos: File[]) => {
    setUploading(true);
    try {
      for (const photo of photos) {
        await uploadItem(photo);
      }
      alert(`🎉 Amazing! We've processed all ${photos.length} of your photos!\n\nYour wardrobe just got a major upgrade! Time to create some stunning outfits. 💫`);
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Oops! 😅 We hit a snag while processing some of your photos.\n\nNo worries though - some items might have been added! Check your wardrobe to see what made it through.');
    } finally {
      setUploading(false);
    }
  };

  const handleSmartItemsDetected = async (items: any[]) => {
    // Handle detected items from Smart Camera
    console.log('Smart Camera detected items:', items);
    // For now, just show a success message
    alert(`Smart Camera detected ${items.length} clothing items!`);
  };

  if (loading) {
    return <Loading message={t('common.loading')} />;
  }

  if (!user) {
    return <AuthRequired />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation user={user} />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            {t('wardrobe.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('wardrobe.subtitle')}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            + {t('wardrobe.uploadItem')}
          </button>
          {enableSmartCamera && (
            <button 
              onClick={() => setShowSmartCamera(true)}
              className="px-8 py-4 border-2 border-purple-600 text-purple-600 text-lg font-semibold rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300"
            >
              📸 Smart Camera
            </button>
          )}
        </motion.div>

        {/* Wardrobe Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {wardrobeItems.length === 0 ? (
                <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👗</span>
              </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">{t('wardrobe.noItems')}</h3>
                  <p className="text-gray-600 mb-6">{t('wardrobe.uploadFirst')}</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all duration-300"
              >
                    {t('wardrobe.uploadItem')}
              </button>
            </div>
          ) : (
            wardrobeItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">👕</span>
                  )}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-2 capitalize">{item.category}</p>
                <p className="text-gray-500 text-xs capitalize">{item.color}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {item.aiAnalysis && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="text-green-600">✓ AI Analyzed</span>
                    {item.aiAnalysis.aiSuggestedCategory !== item.category && (
                      <span className="text-blue-600 ml-2">✓ User Corrected</span>
                    )}
                  </div>
                )}
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={() => editItem(item)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteItem(item._id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['top', 'bottom', 'dress', 'shoes', 'accessories', 'outerwear', 'underwear'].map((categoryKey, index) => {
              const itemCount = wardrobeItems.filter(item => item.category === categoryKey).length;
              
              return (
                <motion.div
                  key={categoryKey}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">👕</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{t(`wardrobe.categories.${categoryKey}`)}</h3>
                  <p className="text-sm text-gray-600">{itemCount} items</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-6 text-center">Add New Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('wardrobe.itemName')}</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Blue Denim Jeans"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('wardrobe.category')}</label>
                <select 
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="dress">Dress</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="underwear">Underwear</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('wardrobe.color')}</label>
                <input
                  type="text"
                  value={uploadForm.color}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Blue, Red, Black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('wardrobe.brand')}</label>
                <input
                  type="text"
                  value={uploadForm.brand}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Nike, Zara, H&M"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('wardrobe.selectImage')}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {uploadForm.image ? (
                      <div>
                        <span className="text-4xl mb-2 block">📸</span>
                        <p className="text-gray-600">{uploadForm.image.name}</p>
                        <p className="text-sm text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl mb-2 block">📸</span>
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">Our AI will automatically analyze and tag your clothing</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-all duration-300"
              >
                {t('wardrobe.cancel')}
              </button>
              <button 
                onClick={handleUpload}
                disabled={uploading || !uploadForm.image}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {uploading ? t('wardrobe.uploading') : t('wardrobe.upload')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Smart Camera */}
      {enableSmartCamera && showSmartCamera && (
        <SmartCamera
          onItemsDetected={handleSmartItemsDetected}
          onClose={() => setShowSmartCamera(false)}
        />
      )}
    </div>
  );
}
