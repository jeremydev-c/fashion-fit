const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');
const verifyToken = require('../middleware/auth');

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get AI-powered outfit recommendations
router.post('/outfit', verifyToken, async (req, res) => {
  try {
    const { occasion, weather, style, colorPreference } = req.body;
    
    // Get user's wardrobe items
    const wardrobeItems = await ClothingItem.find({ user: req.userId });
    
    if (wardrobeItems.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: "Upload some items to your wardrobe first to get personalized recommendations!"
      });
    }

    // Get user's saved favorite outfits to learn preferences
    const favoriteOutfits = await Outfit.find({ 
      user: req.userId, 
      isFavorite: true 
    }).sort({ createdAt: -1 }).limit(10);

    // Get user's learning data for smarter recommendations
    const userLearningData = await Outfit.find({ user: req.userId });
    const learningInsights = analyzeUserLearningData(userLearningData);

    // Get recent recommendations to avoid repetition
    const recentRecommendations = await Outfit.find({ 
      user: req.userId 
    }).sort({ createdAt: -1 }).limit(20);

    // Extract recent outfit combinations to avoid repeating
    const recentCombinations = recentRecommendations.map(outfit => 
      outfit.items.map(item => item.name).sort().join('|')
    );

    // Create wardrobe summary for AI
    const wardrobeSummary = wardrobeItems.map(item => ({
      name: item.name,
      category: item.category,
      color: item.color,
      style: item.aiAnalysis?.style || 'casual',
      occasion: item.occasion || ['casual'],
      weather: item.weather || 'all-season',
      tags: item.tags || []
    }));

    // Generate AI recommendations with learning from favorites and avoiding repetition
    const aiRecommendations = await generateOutfitRecommendations({
      wardrobe: wardrobeSummary,
      occasion: occasion || 'casual',
      weather: weather || 'all-season',
      style: style || 'casual',
      colorPreference: colorPreference || 'any',
      favoriteOutfits: favoriteOutfits,
      userPreferences: await analyzeUserPreferences(favoriteOutfits),
      learningInsights: learningInsights,
      recentCombinations: recentCombinations
    });

    // Convert AI recommendations to outfit combinations
    const outfitCombinations = await createOutfitCombinations(aiRecommendations, wardrobeItems);

    // Save recommendations to database to track them (for anti-repetition)
    await saveRecommendationsToDatabase(outfitCombinations, req.userId, occasion, weather);

    res.json({
      success: true,
      recommendations: outfitCombinations,
      totalItems: wardrobeItems.length,
      learnedFromFavorites: favoriteOutfits.length,
      avoidedRepetitions: recentCombinations.length,
      message: `Generated ${outfitCombinations.length} fresh, personalized outfit combinations! ${favoriteOutfits.length > 0 ? 'AI learned from your favorites!' : ''} ${recentCombinations.length > 0 ? 'Avoided repeating recent suggestions!' : ''}`
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
});

// Analyze user learning data for smarter recommendations
const analyzeUserLearningData = (outfits) => {
  const insights = {
    preferredColors: {},
    preferredStyles: {},
    preferredOccasions: {},
    successfulCombinations: [],
    avoidPatterns: [],
    wearFrequency: {},
    ratingPatterns: {}
  };

  outfits.forEach(outfit => {
    // Color preferences from worn outfits
    if (outfit.wearCount > 0) {
      outfit.items.forEach(item => {
        if (item.color) {
          insights.preferredColors[item.color] = (insights.preferredColors[item.color] || 0) + outfit.wearCount;
        }
      });
    }

    // Style preferences from ratings
    if (outfit.userRating && outfit.userRating >= 4) {
      if (outfit.aiAnalysis?.style) {
        insights.preferredStyles[outfit.aiAnalysis.style] = (insights.preferredStyles[outfit.aiAnalysis.style] || 0) + 1;
      }
    }

    // Occasion preferences
    if (outfit.wearCount > 0 && outfit.occasion) {
      insights.preferredOccasions[outfit.occasion] = (insights.preferredOccasions[outfit.occasion] || 0) + outfit.wearCount;
    }

    // Successful combinations (highly rated and worn)
    if (outfit.userRating >= 4 && outfit.wearCount > 0) {
      const combination = outfit.items.map(item => `${item.category}-${item.color}`).sort().join('|');
      insights.successfulCombinations.push(combination);
    }

    // Patterns to avoid (low rated)
    if (outfit.userRating && outfit.userRating <= 2) {
      const combination = outfit.items.map(item => `${item.category}-${item.color}`).sort().join('|');
      insights.avoidPatterns.push(combination);
    }
  });

  return insights;
};

// Analyze user preferences from favorite outfits
const analyzeUserPreferences = async (favoriteOutfits) => {
  if (favoriteOutfits.length === 0) {
    return {
      preferredColors: [],
      preferredStyles: [],
      preferredCombinations: [],
      stylePatterns: 'No patterns detected yet'
    };
  }

  const colorFrequency = {};
  const styleFrequency = {};
  const combinationPatterns = [];

  favoriteOutfits.forEach(outfit => {
    // Analyze colors
    outfit.items.forEach(item => {
      if (item.color) {
        colorFrequency[item.color] = (colorFrequency[item.color] || 0) + 1;
      }
    });

    // Analyze styles
    if (outfit.aiAnalysis?.style) {
      styleFrequency[outfit.aiAnalysis.style] = (styleFrequency[outfit.aiAnalysis.style] || 0) + 1;
    }

    // Analyze combination patterns
    const categories = outfit.items.map(item => item.category).sort();
    combinationPatterns.push(categories.join('-'));
  });

  // Get top preferences
  const topColors = Object.entries(colorFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([color]) => color);

  const topStyles = Object.entries(styleFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([style]) => style);

  // Find common combination patterns
  const combinationFrequency = {};
  combinationPatterns.forEach(pattern => {
    combinationFrequency[pattern] = (combinationFrequency[pattern] || 0) + 1;
  });

  const topCombinations = Object.entries(combinationFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([pattern]) => pattern);

  return {
    preferredColors: topColors,
    preferredStyles: topStyles,
    preferredCombinations: topCombinations,
    stylePatterns: topColors.length > 0 ? `User prefers ${topColors.join(', ')} colors and ${topStyles.join(', ')} styles` : 'No clear patterns yet'
  };
};

// Generate AI-powered outfit recommendations
const generateOutfitRecommendations = async ({ wardrobe, occasion, weather, style, colorPreference, favoriteOutfits, userPreferences, learningInsights, recentCombinations }) => {
  try {
    const prompt = `You are a professional fashion stylist with access to a user's wardrobe and their style preferences. Create 5 amazing outfit combinations based on the following criteria:

WARDROBE ITEMS:
${JSON.stringify(wardrobe, null, 2)}

CURRENT REQUEST:
- Occasion: ${occasion}
- Weather: ${weather}
- Style: ${style}
- Color Preference: ${colorPreference}

USER'S STYLE PREFERENCES (learned from their favorite outfits):
${favoriteOutfits.length > 0 ? `
FAVORITE OUTFITS ANALYSIS:
${favoriteOutfits.map(outfit => `- "${outfit.name}": ${outfit.items.map(item => item.name).join(' + ')}`).join('\n')}

USER PREFERENCES:
- Preferred Colors: ${userPreferences.preferredColors.join(', ') || 'None detected yet'}
- Preferred Styles: ${userPreferences.preferredStyles.join(', ') || 'None detected yet'}
- Style Patterns: ${userPreferences.stylePatterns}
- Common Combinations: ${userPreferences.preferredCombinations.join(', ') || 'None detected yet'}

ADVANCED AI LEARNING INSIGHTS:
- Colors Most Worn: ${Object.keys(learningInsights.preferredColors).slice(0, 3).join(', ') || 'None yet'}
- Highly Rated Styles: ${Object.keys(learningInsights.preferredStyles).slice(0, 3).join(', ') || 'None yet'}
- Successful Combinations: ${learningInsights.successfulCombinations.slice(0, 3).join(', ') || 'None yet'}
- Patterns to Avoid: ${learningInsights.avoidPatterns.slice(0, 3).join(', ') || 'None yet'}

IMPORTANT: The user has saved ${favoriteOutfits.length} outfits as favorites. Use this information to understand their personal style and create recommendations that align with their preferences while still providing variety.
` : `
USER PREFERENCES: This is their first time getting recommendations. Focus on creating diverse, appealing combinations to help them discover their style.
`}

RECENT RECOMMENDATIONS TO AVOID REPEATING:
${recentCombinations.length > 0 ? `
The user has recently seen these outfit combinations. DO NOT repeat these exact combinations:
${recentCombinations.map(combo => `- ${combo.split('|').join(' + ')}`).join('\n')}

CRITICAL: Create completely NEW combinations that haven't been suggested recently. Be creative and innovative while staying within their style preferences.
` : `
No recent recommendations to avoid - create fresh combinations!
`}

Create 5 different outfit combinations. Each outfit should include:
1. A top (shirt, blouse, sweater, etc.)
2. A bottom (pants, jeans, skirt, etc.)
3. Optional: shoes, accessories, outerwear

For each outfit, provide:
- outfitName: Creative name for the outfit
- items: Array of item names from the wardrobe
- description: Why this combination works
- confidence: Confidence score (0-1)
- styleNotes: Fashion tips and styling advice

${favoriteOutfits.length > 0 ? `
LEARNING STRATEGY:
- Include at least 2 outfits that incorporate their preferred colors/styles
- Create 1-2 outfits that are similar to their favorites but with variations
- Add 1-2 completely new combinations to expand their style
- Mention how outfits relate to their style preferences
- NEVER repeat recent combinations - always create fresh, unique outfits
` : `
FIRST-TIME STRATEGY:
- Create diverse combinations to help them discover their style
- Include different color schemes and styles
- Focus on versatility and appeal
- Ensure all combinations are unique and creative
`}

ANTI-REPETITION RULES:
- NEVER suggest the exact same item combinations as recent recommendations
- Always create fresh, innovative outfit combinations
- If you've suggested similar items before, combine them differently
- Focus on creativity and variety while respecting user preferences
- Each recommendation should feel new and exciting

Return ONLY a JSON array with this structure:
[
  {
    "outfitName": "Casual Chic",
    "items": ["Blue Denim Jeans", "White T-Shirt"],
    "description": "Perfect casual look that's comfortable yet stylish",
    "confidence": 0.9,
    "styleNotes": "Tuck in the shirt for a more polished look"
  }
]

Make sure all item names match exactly with the wardrobe items provided.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const recommendations = response.choices[0].message.content;
    
    // Clean and parse the response
    let cleanRecommendations = recommendations.trim();
    if (cleanRecommendations.startsWith('```json')) {
      cleanRecommendations = cleanRecommendations.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanRecommendations.startsWith('```')) {
      cleanRecommendations = cleanRecommendations.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedRecommendations = JSON.parse(cleanRecommendations);
    console.log('AI Recommendations Generated:', parsedRecommendations);
    
    return parsedRecommendations;

  } catch (error) {
    console.error('AI recommendation generation error:', error);
    // Fallback recommendations
    return generateFallbackRecommendations(wardrobe, occasion, weather);
  }
};

// Save recommendations to database for tracking (anti-repetition)
const saveRecommendationsToDatabase = async (outfitCombinations, userId, occasion, weather) => {
  try {
    for (const outfit of outfitCombinations) {
      const newOutfit = new Outfit({
        user: userId,
        name: outfit.outfitName,
        items: outfit.items.map(item => item._id),
        occasion: occasion ? [occasion] : ['casual'],
        weather: weather || 'all-season',
        aiRecommendationData: {
          style: outfit.styleNotes,
          confidence: outfit.confidence,
          description: outfit.description,
          generatedAt: new Date()
        },
        isFavorite: false, // These are just recommendations, not favorites
        isRecommendation: true // Flag to distinguish from user-created outfits
      });

      await newOutfit.save();
    }
    console.log(`Saved ${outfitCombinations.length} recommendations to database for anti-repetition tracking`);
  } catch (error) {
    console.error('Error saving recommendations to database:', error);
    // Don't throw error - this is just for tracking, not critical
  }
};

// Create outfit combinations from AI recommendations
const createOutfitCombinations = async (aiRecommendations, wardrobeItems) => {
  const combinations = [];

  for (const recommendation of aiRecommendations) {
    const outfitItems = [];
    
    // Find matching items in wardrobe
    for (const itemName of recommendation.items) {
      const item = wardrobeItems.find(w => 
        w.name.toLowerCase().includes(itemName.toLowerCase()) ||
        itemName.toLowerCase().includes(w.name.toLowerCase())
      );
      
      if (item) {
        outfitItems.push({
          _id: item._id,
          name: item.name,
          category: item.category,
          color: item.color,
          imageUrl: item.imageUrl,
          tags: item.tags
        });
      }
    }

    if (outfitItems.length >= 2) { // At least top and bottom
      combinations.push({
        outfitName: recommendation.outfitName,
        items: outfitItems,
        description: recommendation.description,
        confidence: recommendation.confidence || 0.8,
        styleNotes: recommendation.styleNotes || 'Great combination!',
        createdAt: new Date()
      });
    }
  }

  return combinations;
};

// Fallback recommendations when AI fails
const generateFallbackRecommendations = (wardrobe, occasion, weather) => {
  const tops = wardrobe.filter(item => item.category === 'top');
  const bottoms = wardrobe.filter(item => item.category === 'bottom');
  const shoes = wardrobe.filter(item => item.category === 'shoes');
  const outerwear = wardrobe.filter(item => item.category === 'outerwear');

  const combinations = [];
  
  // Create simple combinations
  for (let i = 0; i < Math.min(3, tops.length); i++) {
    for (let j = 0; j < Math.min(3, bottoms.length); j++) {
      const outfit = {
        outfitName: `${tops[i].name} + ${bottoms[j].name}`,
        items: [tops[i].name, bottoms[j].name],
        description: `A stylish combination of ${tops[i].color} ${tops[i].category} with ${bottoms[j].color} ${bottoms[j].category}`,
        confidence: 0.7,
        styleNotes: 'Perfect for everyday wear!'
      };
      
      if (shoes.length > 0) {
        outfit.items.push(shoes[0].name);
      }
      
      combinations.push(outfit);
    }
  }

  return combinations.slice(0, 5);
};

// Rate an outfit (1-5 stars)
router.post('/outfits/:id/rate', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const outfit = await Outfit.findOneAndUpdate(
      { _id: id, user: req.userId },
      { 
        userRating: rating,
        $inc: { 'aiLearningData.timesSuggested': 1 }
      },
      { new: true }
    );

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    // Update average rating
    const allRatings = await Outfit.find({ 
      user: req.userId, 
      userRating: { $exists: true } 
    });
    
    const avgRating = allRatings.reduce((sum, o) => sum + o.userRating, 0) / allRatings.length;
    
    await Outfit.updateMany(
      { user: req.userId },
      { 'aiLearningData.averageRating': avgRating }
    );

    res.json({
      success: true,
      message: 'Outfit rated successfully!',
      outfit: outfit
    });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ error: 'Failed to rate outfit' });
  }
});

// Provide feedback on an outfit
router.post('/outfits/:id/feedback', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!['love', 'like', 'neutral', 'dislike', 'not_my_style'].includes(feedback)) {
      return res.status(400).json({ error: 'Invalid feedback type' });
    }

    const outfit = await Outfit.findOneAndUpdate(
      { _id: id, user: req.userId },
      { feedback: feedback },
      { new: true }
    );

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    res.json({
      success: true,
      message: 'Feedback recorded successfully!',
      outfit: outfit
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// Track outfit wear
router.post('/outfits/:id/wear', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { occasion, weather, rating, notes } = req.body;

    const wearEntry = {
      wornAt: new Date(),
      occasion: occasion || 'casual',
      weather: weather || 'all-season',
      userRating: rating,
      notes: notes
    };

    const outfit = await Outfit.findOneAndUpdate(
      { _id: id, user: req.userId },
      { 
        $push: { wearHistory: wearEntry },
        $inc: { 
          wearCount: 1,
          'aiLearningData.timesWorn': 1
        },
        lastWorn: new Date()
      },
      { new: true }
    );

    if (!outfit) {
      return res.status(404).json({ error: 'Outfit not found' });
    }

    // Update success rate
    const successRate = outfit.aiLearningData.timesWorn / Math.max(outfit.aiLearningData.timesSuggested, 1);
    await Outfit.findByIdAndUpdate(id, { 'aiLearningData.successRate': successRate });

    res.json({
      success: true,
      message: 'Wear tracked successfully!',
      outfit: outfit
    });
  } catch (error) {
    console.error('Wear tracking error:', error);
    res.status(500).json({ error: 'Failed to track wear' });
  }
});

// Get AI learning insights
router.get('/ai-insights', verifyToken, async (req, res) => {
  try {
    const outfits = await Outfit.find({ user: req.userId });
    
    // Calculate learning metrics
    const totalOutfits = outfits.length;
    const ratedOutfits = outfits.filter(o => o.userRating).length;
    const wornOutfits = outfits.filter(o => o.wearCount > 0).length;
    const favoriteOutfits = outfits.filter(o => o.isFavorite).length;
    
    const avgRating = outfits.reduce((sum, o) => sum + (o.userRating || 0), 0) / Math.max(ratedOutfits, 1);
    const wearRate = wornOutfits / Math.max(totalOutfits, 1);
    const favoriteRate = favoriteOutfits / Math.max(totalOutfits, 1);
    
    // Style analysis
    const styleAnalysis = {};
    const colorAnalysis = {};
    const occasionAnalysis = {};
    
    outfits.forEach(outfit => {
      // Style analysis
      if (outfit.aiAnalysis?.style) {
        styleAnalysis[outfit.aiAnalysis.style] = (styleAnalysis[outfit.aiAnalysis.style] || 0) + 1;
      }
      
      // Color analysis
      outfit.items.forEach(item => {
        if (item.color) {
          colorAnalysis[item.color] = (colorAnalysis[item.color] || 0) + 1;
        }
      });
      
      // Occasion analysis
      if (outfit.occasion) {
        occasionAnalysis[outfit.occasion] = (occasionAnalysis[outfit.occasion] || 0) + 1;
      }
    });

    const insights = {
      totalOutfits,
      ratedOutfits,
      wornOutfits,
      favoriteOutfits,
      averageRating: Math.round(avgRating * 10) / 10,
      wearRate: Math.round(wearRate * 100),
      favoriteRate: Math.round(favoriteRate * 100),
      styleAnalysis,
      colorAnalysis,
      occasionAnalysis,
      aiLearningProgress: {
        suggestionsAccuracy: Math.round(avgRating * 20), // Convert to percentage
        userEngagement: Math.round(wearRate * 100),
        styleConsistency: Math.round(favoriteRate * 100)
      }
    };

    res.json({
      success: true,
      insights: insights,
      message: 'AI learning insights generated successfully!'
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
});

// Get weather-based recommendations
router.get('/weather-recommendations', verifyToken, async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    // Get weather data (using OpenWeatherMap API)
    let weatherData = null;
    if (lat && lon) {
      try {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );
        weatherData = await weatherResponse.json();
      } catch (error) {
        console.log('Weather API not available, using default');
      }
    }

    // Determine weather-appropriate recommendations
    let weatherContext = 'all-season';
    let temperature = 20; // Default temperature
    
    if (weatherData) {
      temperature = weatherData.main.temp;
      const weatherMain = weatherData.weather[0].main.toLowerCase();
      
      if (temperature < 10) {
        weatherContext = 'winter';
      } else if (temperature < 20) {
        weatherContext = 'autumn';
      } else if (temperature > 25) {
        weatherContext = 'summer';
      } else {
        weatherContext = 'spring';
      }
    }

    // Get user's wardrobe items
    const wardrobeItems = await ClothingItem.find({ user: req.userId });
    
    if (wardrobeItems.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        weatherContext,
        temperature,
        message: "Upload some items to your wardrobe first to get weather-based recommendations!"
      });
    }

    // Filter items by weather appropriateness
    const weatherAppropriateItems = wardrobeItems.filter(item => {
      if (item.weather === 'all-season') return true;
      return item.weather === weatherContext;
    });

    // Generate weather-based recommendations
    const weatherRecommendations = await generateWeatherBasedRecommendations({
      wardrobe: weatherAppropriateItems,
      weatherContext,
      temperature,
      userPreferences: await analyzeUserPreferences(await Outfit.find({ user: req.userId, isFavorite: true }))
    });

    res.json({
      success: true,
      recommendations: weatherRecommendations,
      weatherContext,
      temperature,
      weatherData: weatherData ? {
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed
      } : null,
      message: `Generated ${weatherRecommendations.length} weather-appropriate outfit recommendations!`
    });

  } catch (error) {
    console.error('Weather recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate weather recommendations' });
  }
});

// Generate weather-based recommendations
const generateWeatherBasedRecommendations = async ({ wardrobe, weatherContext, temperature, userPreferences }) => {
  try {
    const prompt = `You are a professional fashion stylist creating weather-appropriate outfit recommendations.

WARDROBE ITEMS:
${wardrobe.map(item => `${item.name} (${item.category}, ${item.color}, ${item.weather})`).join('\n')}

WEATHER CONTEXT:
- Season: ${weatherContext}
- Temperature: ${temperature}°C
- Weather-appropriate items filtered from wardrobe

USER PREFERENCES:
- Preferred Colors: ${userPreferences.preferredColors.join(', ') || 'None detected yet'}
- Preferred Styles: ${userPreferences.preferredStyles.join(', ') || 'None detected yet'}

Create 3 weather-appropriate outfit combinations that:
1. Are suitable for the current temperature and season
2. Include weather-appropriate items (layers for cold, light fabrics for hot)
3. Match the user's style preferences
4. Are practical and comfortable for the weather

For each outfit, provide:
- outfitName: Creative name for the outfit
- items: Array of item names from the wardrobe
- description: Why this combination works for the weather
- confidence: Confidence score (0-1)
- weatherNotes: Specific weather-related styling tips

Return ONLY a JSON array with this structure:
[
  {
    "outfitName": "Cozy Winter Look",
    "items": ["Warm Sweater", "Jeans", "Boots"],
    "description": "Perfect for cold weather with layered warmth",
    "confidence": 0.9,
    "weatherNotes": "Add a jacket if temperature drops below 5°C"
  }
]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
    });

    const analysis = response.choices[0].message.content;
    let cleanAnalysis = analysis.trim();
    if (cleanAnalysis.startsWith('```json')) {
      cleanAnalysis = cleanAnalysis.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanAnalysis.startsWith('```')) {
      cleanAnalysis = cleanAnalysis.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedRecommendations = JSON.parse(cleanAnalysis);
    return parsedRecommendations;

  } catch (error) {
    console.error('Weather recommendation generation error:', error);
    return [];
  }
};

// Get favorite outfits
router.get('/outfits/favorites', verifyToken, async (req, res) => {
  try {
    const favoriteOutfits = await Outfit.find({ 
      user: req.userId, 
      isFavorite: true 
    })
    .populate('items') // Populate the actual clothing item details
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      favorites: favoriteOutfits,
      count: favoriteOutfits.length,
      message: 'Favorite outfits fetched successfully!'
    });
  } catch (error) {
    console.error('Error fetching favorite outfits:', error);
    res.status(500).json({
      error: 'Failed to fetch favorite outfits',
      details: error.message
    });
  }
});

// Get recommendation history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const outfits = await Outfit.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      outfits: outfits,
      message: 'Recommendation history fetched successfully'
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation history' });
  }
});

// Save outfit to favorites
router.post('/save', verifyToken, async (req, res) => {
  try {
    const { outfitName, items, description, styleNotes } = req.body;

    const outfit = new Outfit({
      user: req.userId,
      name: outfitName,
      items: items,
      description: description,
      styleNotes: styleNotes,
      isFavorite: true,
      createdAt: new Date()
    });

    await outfit.save();

    res.json({
      success: true,
      outfit: outfit,
      message: 'Outfit saved to favorites successfully!'
    });
  } catch (error) {
    console.error('Save outfit error:', error);
    res.status(500).json({ error: 'Failed to save outfit' });
  }
});

// Get style insights and analytics
router.get('/insights', verifyToken, async (req, res) => {
  try {
    const wardrobeItems = await ClothingItem.find({ user: req.userId });
    
    // Analyze wardrobe composition
    const categoryStats = {};
    const colorStats = {};
    const styleStats = {};
    
    wardrobeItems.forEach(item => {
      // Category analysis
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
      
      // Color analysis
      colorStats[item.color] = (colorStats[item.color] || 0) + 1;
      
      // Style analysis
      if (item.aiAnalysis?.style) {
        styleStats[item.aiAnalysis.style] = (styleStats[item.aiAnalysis.style] || 0) + 1;
      }
    });

    // Generate style insights
    const insights = {
      totalItems: wardrobeItems.length,
      categoryBreakdown: categoryStats,
      colorBreakdown: colorStats,
      styleBreakdown: styleStats,
      mostWornCategory: Object.keys(categoryStats).reduce((a, b) => categoryStats[a] > categoryStats[b] ? a : b),
      mostWornColor: Object.keys(colorStats).reduce((a, b) => colorStats[a] > colorStats[b] ? a : b),
      styleProfile: Object.keys(styleStats).reduce((a, b) => styleStats[a] > styleStats[b] ? a : b),
      recommendations: generateStyleInsights(categoryStats, colorStats, styleStats)
    };

    res.json({
      success: true,
      insights: insights,
      message: 'Style insights generated successfully'
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ error: 'Failed to generate style insights' });
  }
});

// Generate style insights
const generateStyleInsights = (categoryStats, colorStats, styleStats) => {
  const recommendations = [];
  
  // Category recommendations
  if (categoryStats.top > categoryStats.bottom) {
    recommendations.push("Consider adding more bottoms to balance your wardrobe!");
  } else if (categoryStats.bottom > categoryStats.top) {
    recommendations.push("You could use more tops to create variety!");
  }
  
  // Color recommendations
  const colors = Object.keys(colorStats);
  if (colors.length < 3) {
    recommendations.push("Try adding more colors to create diverse outfit combinations!");
  }
  
  // Style recommendations
  const styles = Object.keys(styleStats);
  if (styles.length === 1) {
    recommendations.push("Explore different styles to expand your fashion range!");
  }
  
  return recommendations;
};

// Get recommendation history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const recommendations = await Outfit.find({ 
      user: req.userId, 
      isRecommendation: true 
    })
    .populate('items')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      recommendations: recommendations,
      count: recommendations.length,
      message: 'Recommendation history fetched successfully!'
    });
  } catch (error) {
    console.error('Error fetching recommendation history:', error);
    res.status(500).json({
      error: 'Failed to fetch recommendation history',
      details: error.message
    });
  }
});

// AI Fashion Stylist Chatbot
router.post('/fashion-stylist', verifyToken, async (req, res) => {
  try {
    const { message, userWardrobe, userPreferences, userName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user's wardrobe if not provided
    let wardrobe = userWardrobe;
    if (!wardrobe) {
      const wardrobeItems = await ClothingItem.find({ user: req.userId });
      wardrobe = wardrobeItems.map(item => ({
        name: item.name,
        category: item.category,
        color: item.color,
        style: item.aiAnalysis?.style || 'casual',
        occasion: item.occasion || ['casual'],
        weather: item.weather || 'all-season'
      }));
    }

    // Get user's preferences if not provided
    let preferences = userPreferences;
    if (!preferences) {
      const favoriteOutfits = await Outfit.find({ 
        user: req.userId, 
        isFavorite: true 
      }).limit(10);
      preferences = await analyzeUserPreferences(favoriteOutfits);
    }

    // Get user's name for personalization (use from request or fetch from database)
    let finalUserName = userName;
    if (!finalUserName) {
      const User = require('../models/User');
      const user = await User.findById(req.userId);
      finalUserName = user ? user.name : 'Fashion Icon';
    }

    const fashionExpertPrompt = `You are a professional fashion stylist with 20+ years of experience. You specialize ONLY in fashion, style, and clothing advice. You are an expert in:

- Color coordination and matching
- Body type styling and flattering cuts
- Occasion-appropriate dressing
- Current fashion trends
- Accessory pairing
- Style tips and tricks
- Wardrobe organization
- Fashion for different ages and lifestyles

USER'S WARDROBE:
${JSON.stringify(wardrobe, null, 2)}

USER'S NAME: ${finalUserName}

USER'S STYLE PREFERENCES:
- Preferred Colors: ${preferences.preferredColors?.join(', ') || 'Not detected yet'}
- Preferred Styles: ${preferences.preferredStyles?.join(', ') || 'Not detected yet'}
- Style Patterns: ${preferences.stylePatterns || 'Still learning preferences'}

USER'S QUESTION: "${message}"

INSTRUCTIONS:
1. ALWAYS address the user by their name (${finalUserName}) throughout your response
2. Provide expert fashion advice based on the user's wardrobe and preferences
3. Focus ONLY on fashion-related topics
4. Give specific, actionable advice with enthusiasm
5. Consider the user's existing wardrobe when making suggestions
6. Be EXTREMELY encouraging, positive, and motivating
7. Use exciting language that makes fashion fun and exciting
8. Include emojis and exclamation points to show enthusiasm
9. Make the user feel confident and excited about their style
10. If the question is not fashion-related, politely redirect to fashion topics
11. Keep responses engaging and conversational (2-3 paragraphs max)
12. Use fashion terminology appropriately but keep it accessible
13. Consider the user's style preferences when giving advice
14. End responses with encouraging statements about their style potential
15. Make every response feel like a personal styling session with a friend
16. Use the user's name naturally in conversation (e.g., "${finalUserName}, you're going to look amazing!")

Respond as an enthusiastic, encouraging fashion stylist who is genuinely excited about helping ${finalUserName} look amazing. Use their name naturally throughout the conversation to make it personal and engaging!`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: fashionExpertPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const stylistResponse = response.choices[0].message.content;

    res.json({
      success: true,
      stylistResponse: stylistResponse,
      message: 'Fashion stylist advice provided!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Fashion stylist error:', error);
    res.status(500).json({
      error: 'Failed to get fashion advice',
      details: error.message
    });
  }
});

module.exports = router;