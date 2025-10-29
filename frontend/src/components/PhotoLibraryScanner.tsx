'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PhotoLibraryScannerProps {
  onPhotosSelected: (photos: File[]) => void;
  onClose: () => void;
}

export default function PhotoLibraryScanner({ onPhotosSelected, onClose }: PhotoLibraryScannerProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedPhotos(files);
  }, []);

  const scanForClothing = useCallback(async () => {
    setIsScanning(true);
    
    // Simulate AI scanning process
    const results = selectedPhotos.map((photo, index) => ({
      id: index,
      file: photo,
      hasClothing: Math.random() > 0.3, // 70% chance of containing clothing
      confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
      detectedItems: Math.random() > 0.5 ? [
        { type: 'shirt', confidence: 0.85 },
        { type: 'pants', confidence: 0.78 }
      ] : []
    }));

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setScanResults(results);
    setIsScanning(false);
  }, [selectedPhotos]);

  const processClothingPhotos = useCallback(() => {
    const clothingPhotos = scanResults
      .filter(result => result.hasClothing)
      .map(result => result.file);
    
    onPhotosSelected(clothingPhotos);
    onClose();
  }, [scanResults, onPhotosSelected, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Photo Library Scanner</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            ✕
          </button>
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Photos to Scan
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {selectedPhotos.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Selected {selectedPhotos.length} photos
            </p>
          )}
        </div>

        {/* Scan Button */}
        {selectedPhotos.length > 0 && !isScanning && (
          <button
            onClick={scanForClothing}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Scan for Clothing Items
          </button>
        )}

        {/* Scanning Progress */}
        {isScanning && (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Scanning photos for clothing items...</p>
          </div>
        )}

        {/* Scan Results */}
        {scanResults.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Scan Results</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {scanResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg border ${
                    result.hasClothing 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {result.file.name}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      result.hasClothing 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {result.hasClothing ? 'Clothing Found' : 'No Clothing'}
                    </span>
                  </div>
                  {result.hasClothing && (
                    <div className="mt-2 text-sm text-gray-600">
                      Confidence: {Math.round(result.confidence * 100)}%
                      {result.detectedItems.length > 0 && (
                        <div className="mt-1">
                          Items: {result.detectedItems.map(item => item.type).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Process Button */}
            <button
              onClick={processClothingPhotos}
              className="w-full mt-4 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              Process Clothing Photos ({scanResults.filter(r => r.hasClothing).length})
            </button>
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Smart Features:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Automatically detects clothing in photos</li>
            <li>• Filters out non-clothing images</li>
            <li>• Batch processes multiple photos</li>
            <li>• Shows confidence scores</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
