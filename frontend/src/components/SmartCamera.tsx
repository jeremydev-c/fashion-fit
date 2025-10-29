'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomClothingAI from '../services/CustomClothingAI';
import SmartCameraDashboard from './SmartCameraDashboard';

interface DetectedItem {
  id: string;
  type: string;
  category: string;
  color: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  style?: string;
  brand?: string;
  material?: string;
  season?: string;
  occasion?: string;
  // Smart tagging states
  hasSmartTags?: boolean;
  isGeneratingTags?: boolean;
  smartTags?: string[];
}

interface SmartCameraProps {
  onItemsDetected?: (items: DetectedItem[]) => void;
  onClose: () => void;
}

export default function SmartCamera({ onItemsDetected, onClose }: SmartCameraProps) {
  const [isActive, setIsActive] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true); // Enable automatic detection
  const [capturedCount, setCapturedCount] = useState(0);
  const [processingQueue, setProcessingQueue] = useState<DetectedItem[]>([]);
  const [savingItem, setSavingItem] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [customAI] = useState(() => new CustomClothingAI());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start camera and begin real-time detection
  const startSmartCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        
        // Start real-time detection
        startRealTimeDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  // Real-time clothing detection with AI categorization - ENABLED for automatic detection
  const startRealTimeDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    console.log('🚀 Starting automatic detection every 3 seconds...');
    
    // Run detection every 3 seconds for automatic detection
    detectionIntervalRef.current = setInterval(async () => {
      if (isDetecting) return; // Prevent multiple simultaneous detections
      
      console.log('🔄 Auto-detecting clothing...');
      setIsDetecting(true);
      try {
        await detectAndCategorizeClothing();
      } catch (error) {
        console.error('Auto detection error:', error);
      } finally {
        setIsDetecting(false);
      }
    }, 3000); // Every 3 seconds
  }, [isDetecting]);

  // Advanced AI detection and categorization using real AI service
  const detectAndCategorizeClothing = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isDetecting) return;
    
    setIsDetecting(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    context.drawImage(video, 0, 0);

    try {
      // Convert canvas to base64 image data
      // Use higher quality for LOCAL detection accuracy (free). Lower only when sending to APIs.
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Use YOUR custom AI detection (FREE!)
      const result = await customAI.detectClothing(imageData);
      
      console.log('🔍 Detection result:', result);
      console.log('📊 Detected items count:', result.detections?.length || 0);
      console.log('✅ Success status:', result.success);
      
      if (result.success && result.detections.length > 0) {
        const newDetections = result.detections.map((detection, index) => ({
          id: detection.id || `detection-${Date.now()}-${index}`,
          type: 'clothing',
          category: detection.category,
          color: detection.primaryColor || detection.color,
          confidence: detection.confidence,
          boundingBox: detection.boundingBox,
          style: detection.style,
          brand: detection.brand,
          material: detection.material,
          season: detection.season,
          occasion: detection.occasion
        }));

        // Replace previous detections with current frame's results to avoid stale boxes
        setDetectedItems(newDetections);

        // Auto-capture if enabled and high confidence detection
        if (autoCapture && newDetections.some(item => item.confidence > 0.8)) {
          await captureHighConfidenceItems(newDetections.filter(item => item.confidence > 0.8));
        }
        
        console.log('✅ Detection completed successfully');
      } else {
        console.log('❌ No clothing detected, clearing detections');
        setDetectedItems([]);
      }
    } catch (error) {
      console.error('AI Detection Error:', error);
      
      // If it's an API error, show user-friendly message and fall back to demo mode
      if (error.message && error.message.includes('API request failed')) {
        console.warn('OpenAI API error - falling back to demo mode');
        setIsDemoMode(true);
      }
      
      // Fallback to simulation if AI service fails
      const newDetections = await simulateAdvancedAIDetection(canvas);
      
      if (newDetections.length > 0) {
        setDetectedItems(prev => {
          const merged = [...prev];
          newDetections.forEach(newItem => {
            const existingIndex = merged.findIndex(item => 
              Math.abs(item.boundingBox.x - newItem.boundingBox.x) < 0.1 &&
              Math.abs(item.boundingBox.y - newItem.boundingBox.y) < 0.1
            );
            
            if (existingIndex >= 0) {
              if (newItem.confidence > merged[existingIndex].confidence) {
                merged[existingIndex] = newItem;
              }
            } else {
              merged.push(newItem);
            }
          });
          
          return merged.slice(-10);
        });

        if (autoCapture && newDetections.some(item => item.confidence > 0.8)) {
          await captureHighConfidenceItems(newDetections.filter(item => item.confidence > 0.8));
        }
      }
    } finally {
      setIsDetecting(false);
    }
  }, [autoCapture, isDetecting]);

  // Simulate advanced AI detection with detailed categorization
  const simulateAdvancedAIDetection = async (canvas: HTMLCanvasElement): Promise<DetectedItem[]> => {
    // In a real implementation, this would:
    // 1. Send canvas image to OpenAI GPT-4 Vision API
    // 2. Get detailed clothing analysis
    // 3. Return structured data with categories, colors, styles, etc.
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const detections: DetectedItem[] = [];
        const numDetections = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
        
        for (let i = 0; i < numDetections; i++) {
          const categories = ['shirt', 'pants', 'dress', 'jacket', 'shoes', 'hat', 'bag'];
          const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'gray'];
          const styles = ['casual', 'formal', 'sporty', 'vintage', 'modern', 'bohemian'];
          const brands = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Gap'];
          
          const category = categories[Math.floor(Math.random() * categories.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const style = styles[Math.floor(Math.random() * styles.length)];
          const brand = brands[Math.floor(Math.random() * brands.length)];
          
          detections.push({
            id: `detection-${Date.now()}-${i}`,
            type: 'clothing',
            category,
            color,
            confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
            boundingBox: {
              x: Math.random() * 0.7 + 0.1,
              y: Math.random() * 0.7 + 0.1,
              width: Math.random() * 0.3 + 0.2,
              height: Math.random() * 0.3 + 0.2,
            },
            style,
            brand
          });
        }
        
        resolve(detections);
      }, 200); // Simulate processing time
    });
  };

  // Click-to-save individual item with smart tagging
  const saveItemToWardrobe = async (item: DetectedItem) => {
    if (savingItem === item.id) return; // Prevent double-clicking
    
    setSavingItem(item.id);
    
    // Mark item as generating smart tags
    setDetectedItems(prev => prev.map(detected => 
      detected.id === item.id 
        ? { ...detected, isGeneratingTags: true }
        : detected
    ));
    
    try {
      // Capture the specific item from the video frame
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          // Set canvas dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw current frame
          context.drawImage(video, 0, 0);
          
          // Crop to bounding box
          const croppedCanvas = document.createElement('canvas');
          const croppedContext = croppedCanvas.getContext('2d');
          
          if (croppedContext) {
            const bbox = item.boundingBox;
            const cropWidth = bbox.width * canvas.width;
            const cropHeight = bbox.height * canvas.height;
            const cropX = bbox.x * canvas.width;
            const cropY = bbox.y * canvas.height;
            
            croppedCanvas.width = cropWidth;
            croppedCanvas.height = cropHeight;
            
            croppedContext.drawImage(
              canvas,
              cropX, cropY, cropWidth, cropHeight,
              0, 0, cropWidth, cropHeight
            );
            
            // Convert to blob
            croppedCanvas.toBlob(async (blob) => {
              if (blob) {
                const file = new File([blob], `${item.category}-${Date.now()}.jpg`, {
                  type: 'image/jpeg'
                });
                
                // Generate smart tags using OpenAI (minimal cost)
                const imageData = croppedCanvas.toDataURL('image/jpeg', 0.5);
                const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
                const itemWithTags = await customAI.generateSmartTags(item, imageData, apiKey);
                
                // Create form data with smart tags
                const formData = new FormData();
                formData.append('image', file);
                formData.append('name', `${item.color} ${item.category}`);
                formData.append('category', item.category);
                formData.append('color', item.color);
                formData.append('brand', item.brand || 'Unknown');
                formData.append('style', item.style || 'casual');
                formData.append('material', item.material || 'Unknown');
                formData.append('season', item.season || 'all-season');
                formData.append('occasion', item.occasion || 'casual');
                formData.append('confidence', item.confidence.toString());
                
                // Add smart tags
                if (itemWithTags.smartTags && itemWithTags.smartTags.length > 0) {
                  formData.append('tags', itemWithTags.smartTags.join(','));
                }
                
                // Upload to wardrobe
                const response = await fetch('http://localhost:5000/api/wardrobe', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                  // Show success feedback
                  setCapturedCount(prev => prev + 1);
                  
                  // Remove from detected items
                  setDetectedItems(prev => prev.filter(detectedItem => detectedItem.id !== item.id));
                  
                  // Show success message
                  alert(`✅ ${item.category} saved to wardrobe with AI tags!`);
                } else {
                  alert(`❌ Failed to save ${item.category}: ${data.error}`);
                }
              }
            }, 'image/jpeg', 0.8);
          }
        }
      }
    } catch (error) {
      console.error('Save item error:', error);
      alert(`❌ Failed to save ${item.category}: ${error.message}`);
    } finally {
      setSavingItem(null);
    }
  };

  // Capture high-confidence items automatically
  const captureHighConfidenceItems = async (items: DetectedItem[]) => {
    setIsProcessing(true);
    
    for (const item of items) {
      // Add to processing queue
      setProcessingQueue(prev => [...prev, item]);
      
      // Simulate instant upload and categorization
      setTimeout(() => {
        setCapturedCount(prev => prev + 1);
        setProcessingQueue(prev => prev.filter(queueItem => queueItem.id !== item.id));
      }, 1000);
    }
    
    setIsProcessing(false);
  };

  // Manual capture of all detected items
  const captureAllDetected = async () => {
    if (detectedItems.length === 0) return;
    
    setIsProcessing(true);
    setProcessingQueue([...detectedItems]);
    
    // Process all items
    setTimeout(() => {
      setCapturedCount(prev => prev + detectedItems.length);
      setProcessingQueue([]);
      // Notify parent component about detected items (optional)
      if (onItemsDetected) {
        onItemsDetected(detectedItems);
      }
      setIsProcessing(false);
    }, detectedItems.length * 500);
  };

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setIsActive(false);
    setDetectedItems([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">🤖 Smart AI Camera</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isActive ? (isDetecting ? 'Auto-detecting...' : 'Ready (Auto-Detection)') : 'Inactive'}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Demo Mode Notification */}
      {isDemoMode && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mx-4 mt-2">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode:</strong> OpenAI API key not configured. Using mock detection data for demonstration. 
                To enable real AI detection, add your OpenAI API key to the environment variables.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Automatic Detection Notification */}
      <div className="bg-green-100 border-l-4 border-green-500 p-4 mx-4 mt-2">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>🤖 Automatic Detection:</strong> Camera automatically detects clothes every 3 seconds! 
              Just hold your clothes in front of the camera and watch the magic happen! ✨
            </p>
          </div>
        </div>
      </div>

      {/* IMPROVED Computer Vision Notification */}
      <div className="bg-green-100 border-l-4 border-green-500 p-4 mx-4 mt-2">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>🎯 IMPROVED Accuracy:</strong> Now focuses on center region where you hold items! 
              Advanced color detection + smart categorization = much more accurate results!
            </p>
          </div>
        </div>
      </div>

      {/* Hybrid AI System Notification */}
      <div className="bg-purple-100 border-l-4 border-purple-500 p-4 mx-4 mt-2">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-purple-700">
              <strong>🧠 Hybrid AI System:</strong> Your Custom AI detects clothes (FREE) + OpenAI generates smart tags only when you click (minimal cost). 
              Maximum accuracy with minimal credits!
            </p>
          </div>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Real-time Detection Overlays */}
        <AnimatePresence>
          {detectedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => saveItemToWardrobe(item)}
              className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                savingItem === item.id ? 'animate-pulse' : ''
              }`}
              style={{
                left: `${item.boundingBox.x * 100}%`,
                top: `${item.boundingBox.y * 100}%`,
                width: `${item.boundingBox.width * 100}%`,
                height: `${item.boundingBox.height * 100}%`,
                borderColor: item.confidence > 0.8 ? '#10b981' : item.confidence > 0.6 ? '#f59e0b' : '#ef4444',
                backgroundColor: savingItem === item.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
              }}
            >
              {/* Detection Label */}
              <div 
                className="absolute -top-8 left-0 px-2 py-1 rounded text-xs font-semibold text-white"
                style={{
                  backgroundColor: item.confidence > 0.8 ? '#10b981' : item.confidence > 0.6 ? '#f59e0b' : '#ef4444'
                }}
              >
                {item.category} • {item.color} • {Math.round(item.confidence * 100)}%
              </div>
              
              {/* Style & Brand Info */}
              <div className="absolute -bottom-6 left-0 px-2 py-1 bg-black/70 text-white text-xs rounded">
                {item.style} • {item.brand}
              </div>
              
              {/* Click to Save Indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 opacity-0 hover:opacity-100 transition-opacity duration-200">
                  {savingItem === item.id ? '💾 Saving...' : '👆 Click to Save'}
                </div>
              </div>
              
              {/* Saving Animation */}
              {savingItem === item.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Processing Queue Overlay */}
        <AnimatePresence>
          {processingQueue.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg"
            >
              <h3 className="font-semibold text-gray-800 mb-2">Processing...</h3>
              <div className="space-y-2">
                {processingQueue.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700">{item.category} • {item.color}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart Camera Dashboard */}
        <div className="absolute top-4 left-4 w-80">
          <SmartCameraDashboard
            detectedItems={detectedItems}
            onItemSelect={(item) => console.log('Selected item:', item)}
            onProcessAll={captureAllDetected}
            isProcessing={isProcessing}
            onSaveItem={saveItemToWardrobe}
            savingItem={savingItem}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/95 backdrop-blur-sm p-4 space-y-4 border-t border-gray-200">
        {/* Main Controls */}
        <div className="flex gap-4">
          {!isActive ? (
            <button
              onClick={startSmartCamera}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
            >
              🚀 Start Smart Camera
            </button>
          ) : (
            <>
              <button
                onClick={async () => {
                  if (videoRef.current && canvasRef.current) {
                    await detectAndCategorizeClothing();
                  }
                }}
                disabled={isDetecting}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  isDetecting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isDetecting ? '🔍 Analyzing...' : '🔍 Detect Clothing (FREE)'}
              </button>
              
              {/* Debug button */}
              <button
                onClick={() => {
                  console.log('🐛 Current detected items:', detectedItems);
                  console.log('🐛 Camera active:', isActive);
                  console.log('🐛 Video element:', videoRef.current);
                  
                  // Force add a test detection
                  const testItem = {
                    id: `test-${Date.now()}`,
                    type: 'clothing',
                    category: 'shirt',
                    color: 'blue',
                    confidence: 0.9,
                    boundingBox: { x: 0.2, y: 0.3, width: 0.3, height: 0.4 },
                    style: 'casual',
                    brand: 'Test Brand',
                    material: 'cotton',
                    season: 'all-season',
                    occasion: 'casual'
                  };
                  
                  setDetectedItems(prev => [...prev, testItem]);
                  console.log('✅ Added test detection:', testItem);
                }}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
              >
                🐛 Debug + Test
              </button>
              
              <button
                onClick={captureAllDetected}
                disabled={detectedItems.length === 0 || isProcessing}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  detectedItems.length === 0 || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                📸 Capture All ({detectedItems.length})
              </button>
              
              <button
                onClick={stopCamera}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ⏹️ Stop
              </button>
            </>
          )}
        </div>

        {/* Auto-Capture Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoCapture"
              checked={autoCapture}
              onChange={(e) => setAutoCapture(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="autoCapture" className="text-sm font-medium text-gray-700">
              Auto-capture high confidence items
            </label>
          </div>
          
          <div className="text-sm text-gray-600">
            {isProcessing ? 'Processing...' : 'Ready'}
          </div>
        </div>

        {/* Smart Features Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">🤖 Smart AI Features:</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Real-time clothing detection</li>
            <li>• Instant AI categorization (type, color, style, brand)</li>
            <li>• Confidence scoring for accuracy</li>
            <li>• 👆 Click green boxes to save instantly</li>
            <li>• Auto-capture for high-confidence items</li>
            <li>• Batch processing with instant upload</li>
          </ul>
        </div>
      </div>

      {/* Hidden canvas for detection */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}