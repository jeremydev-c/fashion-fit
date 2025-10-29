const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['top', 'bottom', 'dress', 'shoes', 'accessories', 'outerwear', 'underwear'],
    required: true
  },
  subcategory: {
    type: String,
    enum: ['t-shirt', 'shirt', 'blouse', 'tank-top', 'sweater', 'hoodie', 'jeans', 'pants', 'shorts', 'skirt', 'sneakers', 'boots', 'heels', 'sandals', 'hat', 'bag', 'jewelry', 'jacket', 'coat', 'blazer']
  },
  color: {
    type: String,
    enum: ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'brown', 'gray', 'navy', 'beige', 'maroon', 'olive'],
    required: true
  },
  brand: String,
  size: String,
  imageUrl: {
    type: String,
    required: true
  },
  tags: [String],
  weather: {
    type: String,
    enum: ['summer', 'winter', 'spring', 'autumn', 'all-season']
  },
  occasion: [{
    type: String,
    enum: ['casual', 'formal', 'work', 'party', 'sports', 'date', 'travel']
  }],
  aiAnalysis: {
    dominantColors: [String],
    style: String,
    confidence: Number
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  wearCount: {
    type: Number,
    default: 0
  },
  lastWorn: Date
}, {
  timestamps: true
});

// Indexes for better query performance
clothingItemSchema.index({ user: 1, category: 1 });
clothingItemSchema.index({ user: 1, color: 1 });
clothingItemSchema.index({ user: 1, occasion: 1 });

module.exports = mongoose.model('ClothingItem', clothingItemSchema);
