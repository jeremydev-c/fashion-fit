const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup - had some issues with this before deployment
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000']; // default for local dev

app.use(cors({
  origin: (origin, callback) => {
    // Handle requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Dev mode - be permissive (saves headaches)
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Production - strict origin checking
    // Had a bug here before where I wasn't checking prefixes properly
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin?.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from: ${origin}`); // helpful for debugging
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true // needed for cookies
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Session config for OAuth - Google requires some specific settings
app.use(session({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key', // TODO: generate better default
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true, // prevents XSS attacks
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' needed for cross-site in prod
    maxAge: 24 * 60 * 60 * 1000 // 24 hours seems reasonable
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const wardrobeRoutes = require('./src/routes/wardrobe');
const outfitRoutes = require('./src/routes/outfits');
const recommendationRoutes = require('./src/routes/recommendations');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fashion Fit API is running!',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/recommendations', recommendationRoutes);

// DB connection - mongoose handles connection pooling automatically
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion-fit';
    const conn = await mongoose.connect(mongoURI);
    console.log(`💾 MongoDB Connected: ${conn.connection.host}`);
    // console.log('DB name:', conn.connection.name); // sometimes useful for debugging
  } catch (error) {
    console.error('Database connection error:', error);
    // Exit if we can't connect - no point running without DB
    process.exit(1);
  }
};

// Global error handler - catch anything that slips through
// Learned the hard way that OAuth errors need special handling
app.use((error, req, res, next) => {
  console.error('Global error handler caught:', error.name, error.message);
  
  // Google OAuth token issues - redirect to frontend with error flag
  if (error.name === 'TokenError') {
    console.error('OAuth TokenError - redirecting to frontend:', error.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}?error=auth_failed`);
  }
  
  // Mongoose duplicate key (email already exists, etc)
  if (error.code === 11000) {
    console.error('Duplicate key error - probably email already registered');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}?error=duplicate_user`);
  }
  
  // Generic server error - don't expose internals
  res.status(500).json({ error: 'Internal server error' });
});

// Start everything up
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Fashion Fit API running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      
      // Quick sanity checks
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('your-super-secret')) {
        console.warn('⚠️  Warning: Using default JWT secret - change this in production!');
      }
      
      console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'NOT CONFIGURED'}`);
      console.log(`💾 Database: MongoDB Connected`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

startServer().catch(console.error);

module.exports = app;
