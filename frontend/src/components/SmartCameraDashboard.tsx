'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DetectedItem {
  id: string;
  category: string;
  color: string;
  confidence: number;
  style?: string;
  brand?: string;
  material?: string;
  season?: string;
  occasion?: string;
}

interface SmartCameraDashboardProps {
  detectedItems: DetectedItem[];
  onItemSelect: (item: DetectedItem) => void;
  onProcessAll: () => void;
  isProcessing: boolean;
  onSaveItem?: (item: DetectedItem) => void;
  savingItem?: string | null;
}

export default function SmartCameraDashboard({ 
  detectedItems, 
  onItemSelect, 
  onProcessAll, 
  isProcessing,
  onSaveItem,
  savingItem
}: SmartCameraDashboardProps) {
  const [selectedItem, setSelectedItem] = useState<DetectedItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleItemClick = (item: DetectedItem) => {
    setSelectedItem(item);
    setShowDetails(true);
    onItemSelect(item);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">🤖 AI Detection Results</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">
            {detectedItems.length} items detected
          </span>
        </div>
      </div>

      {/* Detection Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{detectedItems.length}</div>
          <div className="text-xs text-blue-600">Total Items</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {detectedItems.filter(item => item.confidence >= 0.8).length}
          </div>
          <div className="text-xs text-green-600">High Confidence</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(detectedItems.map(item => item.category)).size}
          </div>
          <div className="text-xs text-purple-600">Categories</div>
        </div>
      </div>

      {/* Detected Items List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {detectedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleItemClick(item)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 capitalize">
                      {item.category}
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.color}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    {item.style && (
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {item.style}
                      </span>
                    )}
                    {item.brand && (
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {item.brand}
                      </span>
                    )}
                  </div>
                  
                  {/* Click to Save Button */}
                  {onSaveItem && (
                    <button
                      onClick={() => onSaveItem(item)}
                      disabled={savingItem === item.id}
                      className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors ${
                        savingItem === item.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {savingItem === item.id ? '💾 Saving...' : '👆 Save to Wardrobe'}
                    </button>
                  )}
                </div>
                
                <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                  {Math.round(item.confidence * 100)}%
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Process All Button */}
      {detectedItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onProcessAll}
            disabled={isProcessing}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing {detectedItems.length} items...
              </div>
            ) : (
              `📸 Process All ${detectedItems.length} Items`
            )}
          </button>
        </div>
      )}

      {/* Item Details Modal */}
      <AnimatePresence>
        {showDetails && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Item Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Category</label>
                      <div className="text-lg font-semibold text-gray-800 capitalize">
                        {selectedItem.category}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Color</label>
                      <div className="text-lg font-semibold text-gray-800 capitalize">
                        {selectedItem.color}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">🤖 AI Analysis</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedItem.style && (
                      <div>
                        <span className="text-blue-600 font-medium">Style:</span>
                        <div className="text-gray-800 capitalize">{selectedItem.style}</div>
                      </div>
                    )}
                    {selectedItem.brand && (
                      <div>
                        <span className="text-blue-600 font-medium">Brand:</span>
                        <div className="text-gray-800">{selectedItem.brand}</div>
                      </div>
                    )}
                    {selectedItem.material && (
                      <div>
                        <span className="text-blue-600 font-medium">Material:</span>
                        <div className="text-gray-800 capitalize">{selectedItem.material}</div>
                      </div>
                    )}
                    {selectedItem.season && (
                      <div>
                        <span className="text-blue-600 font-medium">Season:</span>
                        <div className="text-gray-800 capitalize">{selectedItem.season}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-800">Confidence Score</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(selectedItem.confidence)}`}>
                      {Math.round(selectedItem.confidence * 100)}% - {getConfidenceText(selectedItem.confidence)}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedItem.confidence >= 0.8 ? 'bg-green-500' :
                        selectedItem.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedItem.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Handle individual item processing
                      console.log('Processing item:', selectedItem);
                      setShowDetails(false);
                    }}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Process This Item
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
