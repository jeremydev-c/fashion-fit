'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import Navigation from '../../components/Navigation';
import AuthRequired from '../../components/AuthRequired';
import Loading from '../../components/Loading';
import { useTranslations } from '../../hooks/useTranslations';

export default function Profile() {
  const { user, loading, token } = useAuth();
  const { t } = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewPicture, setPreviewPicture] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (loading) {
    return <Loading message={t('common.loading')} />;
  }

  if (!user) {
    return <AuthRequired />;
  }

  const handleEdit = () => {
    setIsEditing(true);
    setName(user.name || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user.name || '');
  };

  const handleSave = async () => {
    if (!token || !name.trim()) {
      alert('Hey there! 👋\n\nWe\'d love to know what to call you! Please enter your name so we can personalize your experience.');
      return;
    }

    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Perfect! ✨ Your profile has been updated!\n\nGreat to meet you, ${name.trim()}! 👋`);
        setIsEditing(false);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert('Oops! 😅 We couldn\'t update your profile right now.\n\n' + (data.error || 'Please try again in a moment - sometimes these things need a second attempt!'));
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      alert('Hmm, something went wrong while updating your profile. 🙈\n\nDon\'t worry - your changes are safe! Let\'s try that again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePictureUpload = async () => {
    if (!selectedFile || !token) return;

    setUploadingPicture(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('picture', selectedFile);

      const response = await fetch(`${apiUrl}/api/users/profile/picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Perfect! 📸 Your new profile picture looks amazing!\n\nWe\'ve updated it - refresh to see your stylish new look! ✨');
        setPreviewPicture(null);
        setSelectedFile(null);
        // Refresh the page to show updated picture
        window.location.reload();
      } else {
        alert('Oops! 😅 We couldn\'t upload your picture right now.\n\n' + (data.error || 'Make sure the image is under 5MB and try again!'));
      }
    } catch (error: any) {
      console.error('Picture upload error:', error);
      alert('Hmm, something went wrong while uploading your picture. 🙈\n\nDon\'t worry - your photo is safe! Check your internet connection and try again.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleCancelPicture = () => {
    setPreviewPicture(null);
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById('picture-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation user={user} />
      
      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
            {t('profile.title')}
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <img
                  src={previewPicture || user.profilePicture || '/default-avatar.png'}
                  alt={user.name || 'Profile'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                />
                {uploadingPicture && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Profile Picture</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <input
                      id="picture-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePictureSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="picture-input"
                      className="cursor-pointer inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Choose Image
                    </label>
                  </div>
                  {previewPicture && (
                    <div className="flex gap-2">
                      <button
                        onClick={handlePictureUpload}
                        disabled={uploadingPicture}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {uploadingPicture ? 'Uploading...' : 'Upload'}
                      </button>
                      <button
                        onClick={handleCancelPicture}
                        disabled={uploadingPicture}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Max file size: 5MB. Supported formats: JPG, PNG, GIF</p>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Account Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Name:</span> {user.name}</p>
                  {user.id && <p><span className="font-medium">User ID:</span> {user.id}</p>}
                </div>
              </div>

              {!isEditing && (
                <div className="pt-4">
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    {t('profile.edit')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
