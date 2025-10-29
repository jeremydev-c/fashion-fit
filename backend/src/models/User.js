const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  preferences: {
    style: {
      type: String,
      enum: ['casual', 'formal', 'sporty', 'bohemian', 'minimalist', 'vintage'],
      default: 'casual'
    },
    colors: [{
      type: String,
      enum: ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'brown', 'gray', 'navy']
    }],
    brands: [String],
    sizes: {
      top: String,
      bottom: String,
      shoes: String
    }
  },
  wardrobe: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem'
  }],
  outfits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
