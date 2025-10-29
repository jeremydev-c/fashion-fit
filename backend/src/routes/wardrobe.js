const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const OpenAI = require('openai');
const ClothingItem = require('../models/ClothingItem');
const jwt = require('jsonwebtoken');

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads - using memory storage since we upload to Cloudinary
// Tried disk storage first but memory works better for this use case
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory temporarily
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit - reasonable for clothing photos
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to verify JWT token - used across all protected routes
const verifyToken = (req, res, next) => {
  // Extract token from Authorization header (format: "Bearer <token>")
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Get token after "Bearer "
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach userId to request for use in routes
    next();
  } catch (error) {
    // Token expired, invalid, or tampered with
    // console.log('Token verification failed:', error.name); // for debugging
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// AI Image Analysis Function
const analyzeImageWithAI = async (imageUrl) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this clothing item image and provide detailed information. Return a JSON object with the following structure: { category: 'string', color: 'string', style: 'string', brand: 'string', occasion: ['array'], weather: 'string', tags: ['array'], description: 'string' }. IMPORTANT CATEGORY RULES: 'top': shirts, t-shirts, blouses, sweaters, hoodies, tank tops, polo shirts, button-ups. 'bottom': pants, jeans, trousers, shorts, skirts, leggings, joggers, sweatpants. 'dress': dresses, jumpsuits, rompers, one-piece garments. 'shoes': sneakers, boots, heels, sandals, flats, loafers, any footwear. 'accessories': bags, hats, jewelry, belts, scarves, watches. 'outerwear': jackets, coats, blazers, cardigans, vests. 'underwear': bras, panties, undershirts, lingerie. Color must be one of: black, white, red, blue, green, yellow, purple, pink, orange, brown, gray, navy, beige, maroon, olive. Weather must be one of: summer, winter, spring, autumn, all-season. Occasion must be from: casual, formal, work, party, sports, date, travel. Look carefully at the clothing item and determine if it's worn on the upper body (top) or lower body (bottom). Pants, jeans, trousers, shorts, and skirts are ALWAYS 'bottom'. Shirts, t-shirts, blouses, and sweaters are ALWAYS 'top'."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const analysis = response.choices[0].message.content;
    console.log('Raw AI Response:', analysis); // Debug log
    
    // Clean the response - remove markdown code blocks if present
    let cleanAnalysis = analysis.trim();
    if (cleanAnalysis.startsWith('```json')) {
      cleanAnalysis = cleanAnalysis.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanAnalysis.startsWith('```')) {
      cleanAnalysis = cleanAnalysis.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('Cleaned AI Response:', cleanAnalysis); // Debug log
    
    // Try to parse JSON response
    try {
      const parsedAnalysis = JSON.parse(cleanAnalysis);
      console.log('Parsed AI Analysis:', parsedAnalysis); // Debug log
      // Validate and fix the analysis data
      return {
        category: parsedAnalysis.category || 'top',
        color: parsedAnalysis.color || 'black',
        style: parsedAnalysis.style || 'casual',
        brand: parsedAnalysis.brand || 'unknown',
        occasion: Array.isArray(parsedAnalysis.occasion) ? parsedAnalysis.occasion : ['casual'],
        weather: parsedAnalysis.weather || 'all-season',
        tags: Array.isArray(parsedAnalysis.tags) ? parsedAnalysis.tags : ['clothing'],
        description: parsedAnalysis.description || 'Clothing item'
      };
    } catch (parseError) {
      console.error('AI Parse Error:', parseError);
      console.error('Raw AI Response:', analysis);
      // If parsing fails, return structured data from text
      return {
        category: 'top',
        color: 'black',
        style: 'casual',
        brand: 'unknown',
        occasion: ['casual'],
        weather: 'all-season',
        tags: ['clothing'],
        description: analysis
      };
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      category: 'top',
      color: 'black',
      style: 'casual',
      brand: 'unknown',
      occasion: ['casual'],
      weather: 'all-season',
      tags: ['clothing'],
      description: 'AI analysis failed'
    };
  }
};

// Upload and analyze clothing item
router.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { name, category, color, brand } = req.body;

    // Upload image to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'fashion-fit/wardrobe',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Analyze image with AI
    const aiAnalysis = await analyzeImageWithAI(cloudinaryResult.secure_url);
    console.log('AI Analysis Result:', aiAnalysis); // Debug log
    console.log('Form Category:', category); // Debug log

    // Use manual category if provided, otherwise use AI analysis
    const finalCategory = category || aiAnalysis.category;
    console.log('Form Category:', category);
    console.log('AI Suggested Category:', aiAnalysis.category);
    console.log('Final Category Used:', finalCategory);
    
    // Create clothing item in database
    const clothingItem = new ClothingItem({
      user: req.userId,
      name: name || aiAnalysis.description || 'Clothing Item',
      category: finalCategory,
      color: color || aiAnalysis.color,
      brand: brand || aiAnalysis.brand,
      imageUrl: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      tags: aiAnalysis.tags || [],
      occasion: aiAnalysis.occasion || [],
      weather: aiAnalysis.weather || 'all-season',
      aiAnalysis: {
        style: aiAnalysis.style,
        description: aiAnalysis.description,
        confidence: 0.95,
        analyzedAt: new Date(),
        aiSuggestedCategory: aiAnalysis.category,
        userSelectedCategory: category || null
      }
    });

    console.log('Item to be saved:', {
      category: clothingItem.category,
      aiSuggestedCategory: clothingItem.aiAnalysis.aiSuggestedCategory,
      userSelectedCategory: clothingItem.aiAnalysis.userSelectedCategory
    });

    await clothingItem.save();

    res.json({
      success: true,
      item: {
        _id: clothingItem._id,
        name: clothingItem.name,
        category: clothingItem.category,
        color: clothingItem.color,
        brand: clothingItem.brand,
        imageUrl: clothingItem.imageUrl,
        tags: clothingItem.tags,
        occasion: clothingItem.occasion,
        weather: clothingItem.weather,
        createdAt: clothingItem.createdAt
      },
      message: 'Item uploaded and analyzed successfully!'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
});

// Get user's wardrobe items
router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await ClothingItem.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items: items,
      count: items.length
    });
  } catch (error) {
    console.error('Get wardrobe error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wardrobe', 
      details: error.message 
    });
  }
});

// Get items by category
router.get('/category/:category', verifyToken, async (req, res) => {
  try {
    const { category } = req.params;
    const items = await ClothingItem.find({ 
      user: req.userId, 
      category: category 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      items: items,
      count: items.length,
      category: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch category items', 
      details: error.message 
    });
  }
});

// Delete clothing item
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await ClothingItem.findOne({ 
      _id: id, 
      user: req.userId 
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete from Cloudinary
    if (item.cloudinaryId) {
      await cloudinary.uploader.destroy(item.cloudinaryId);
    }

    // Delete from database
    await ClothingItem.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete item', 
      details: error.message 
    });
  }
});

// Update clothing item
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await ClothingItem.findOneAndUpdate(
      { _id: id, user: req.userId },
      updates,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({
      success: true,
      item: item,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      error: 'Failed to update item', 
      details: error.message 
    });
  }
});

// Get wardrobe statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const stats = await ClothingItem.aggregate([
      { $match: { user: req.userId } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          categories: { $addToSet: '$category' },
          colors: { $addToSet: '$color' },
          brands: { $addToSet: '$brand' }
        }
      }
    ]);

    const categoryStats = await ClothingItem.aggregate([
      { $match: { user: req.userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: stats[0] || { totalItems: 0, categories: [], colors: [], brands: [] },
      categoryStats: categoryStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats', 
      details: error.message 
    });
  }
});

module.exports = router;