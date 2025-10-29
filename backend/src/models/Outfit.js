const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  items: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    category: String,
    color: String,
    imageUrl: String,
    tags: [String]
  }],
  description: {
    type: String,
    required: true
  },
  styleNotes: String,
  occasion: {
    type: String,
    enum: ['casual', 'formal', 'work', 'party', 'sports', 'date', 'travel']
  },
  weather: {
    type: String,
    enum: ['summer', 'winter', 'spring', 'autumn', 'all-season']
  },
  aiAnalysis: {
    confidence: Number,
    style: String,
    generatedAt: Date
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isRecommendation: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  wearCount: {
    type: Number,
    default: 0
  },
  lastWorn: Date,
  // Advanced AI Learning Fields
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    enum: ['love', 'like', 'neutral', 'dislike', 'not_my_style'],
    default: null
  },
  wearHistory: [{
    wornAt: {
      type: Date,
      default: Date.now
    },
    occasion: String,
    weather: String,
    userRating: Number,
    notes: String
  }],
  aiLearningData: {
    timesSuggested: {
      type: Number,
      default: 0
    },
    timesSaved: {
      type: Number,
      default: 0
    },
    timesWorn: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: null
    },
    successRate: {
      type: Number,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
outfitSchema.index({ user: 1, createdAt: -1 });
outfitSchema.index({ user: 1, isFavorite: 1 });
outfitSchema.index({ user: 1, occasion: 1 });
outfitSchema.index({ user: 1, isRecommendation: 1, createdAt: -1 });

module.exports = mongoose.model('Outfit', outfitSchema);