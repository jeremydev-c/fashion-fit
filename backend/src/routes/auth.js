const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Resend } = require('resend');

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to get API URL (supports Railway, Render, and local dev)
function getApiUrl() {
  // Check RENDER_EXTERNAL_URL first (Render automatically sets this)
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  // Check RAILWAY_PUBLIC_DOMAIN (Railway automatically sets this)
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  // Check manual API_URL configuration
  if (process.env.API_URL) {
    // Ensure it has protocol
    let apiUrl = process.env.API_URL.trim();
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = `https://${apiUrl}`;
    }
    return apiUrl;
  }
  // Local development fallback
  return `http://localhost:${process.env.PORT || 5000}`;
}

// Email functions
const sendWelcomeEmail = async (user) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Fashion Fit <hello@modenova.co.ke>',
      to: [user.email],
      subject: 'Welcome to Fashion Fit - Your Style Journey Begins!',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Fashion Fit App',
        'Reply-To': 'hello@modenova.co.ke'
      },
      tags: [
        {
          name: 'category',
          value: 'welcome'
        },
        {
          name: 'user_type',
          value: 'new_user'
        }
      ],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Fashion Fit!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Hi ${user.name}! 👋</p>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Style Journey Starts Now!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We're thrilled to have you join the Fashion Fit community! You're about to discover a whole new way to look and feel amazing every day.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Upload Your Wardrobe:</strong> Add photos of your favorite clothes</li>
                <li><strong>Get AI Recommendations:</strong> Discover perfect outfit combinations</li>
                <li><strong>Track Your Style:</strong> See your fashion preferences and trends</li>
                <li><strong>Plan Outfits:</strong> Create looks for any occasion</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Start Your Style Journey →
              </a>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Pro Tips for Getting Started:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Start by uploading 5-10 of your favorite pieces</li>
                <li>Try our AI recommendations for your next outfit</li>
                <li>Share your looks with friends for feedback</li>
                <li>Check out our style insights to learn more about fashion</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              Need help getting started? Just reply to this email and we'll be happy to assist you!
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Happy styling!<br>
              The Fashion Fit Team 💜
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              You're receiving this email because you signed up for Fashion Fit.<br>
              <a href="#" style="color: #667eea;">Unsubscribe</a> | <a href="#" style="color: #667eea;">Privacy Policy</a>
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Welcome email error:', error);
    } else {
      console.log('Welcome email sent successfully to:', user.email);
    }
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

const sendWelcomeBackEmail = async (user) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Fashion Fit <hello@modenova.co.ke>',
      to: [user.email],
      subject: 'Welcome Back to Fashion Fit!',
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Fashion Fit App',
        'Reply-To': 'hello@modenova.co.ke'
      },
      tags: [
        {
          name: 'category',
          value: 'welcome_back'
        },
        {
          name: 'user_type',
          value: 'returning_user'
        }
      ],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 32px;">Welcome Back!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Hi ${user.name}! 👋</p>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Great to See You Again!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We're excited to have you back! Your wardrobe and style preferences are waiting for you. Let's continue your fashion journey!
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Quick Actions:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Check Your Wardrobe:</strong> See all your uploaded clothes</li>
                <li><strong>Get New Recommendations:</strong> Fresh AI outfit suggestions</li>
                <li><strong>View Your Style Stats:</strong> Track your fashion journey</li>
                <li><strong>Plan Today's Outfit:</strong> Create the perfect look</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Continue Your Style Journey →
              </a>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">What's New?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Enhanced AI recommendations with better accuracy</li>
                <li>New outfit planning tools for special occasions</li>
                <li>Improved style analytics and insights</li>
                <li>Better wardrobe organization features</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              Ready to look amazing? Let's get started!
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Happy styling!<br>
              The Fashion Fit Team 💜
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              You're receiving this email because you're a valued Fashion Fit member.<br>
              <a href="#" style="color: #667eea;">Unsubscribe</a> | <a href="#" style="color: #667eea;">Privacy Policy</a>
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Welcome back email error:', error);
    } else {
      console.log('Welcome back email sent successfully to:', user.email);
    }
  } catch (error) {
    console.error('Failed to send welcome back email:', error);
  }
};

// Configure Google OAuth Strategy with better error handling
// Support both Railway and Render deployment platforms
const callbackURL = `${getApiUrl()}/api/auth/google/callback`;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth Profile:', profile);
    
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      console.log('Existing user found:', user.email);
      // Send welcome back email for returning user
      sendWelcomeBackEmail(user);
      return done(null, user);
    }
    
    // Also check by email in case googleId is different
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      console.log('Existing user found by email, updating googleId:', user.email);
      user.googleId = profile.id;
      user.name = profile.displayName;
      user.profilePicture = profile.photos[0].value;
      await user.save();
      // Send welcome back email for returning user
      sendWelcomeBackEmail(user);
      return done(null, user);
    }
    
    // Create new user
    console.log('Creating new user:', profile.emails[0].value);
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      profilePicture: profile.photos[0].value,
      preferences: {
        style: 'casual',
        colors: [],
        brands: []
      },
      wardrobe: [],
      outfits: []
    });
    
    await user.save();
    console.log('New user created:', user.email);
    // Send welcome email for new user
    sendWelcomeEmail(user);
    return done(null, user);
  } catch (error) {
    console.error('OAuth strategy error:', error);
    return done(error, null);
  }
}));

// Direct OAuth test (bypasses Passport)
router.get('/test-oauth', async (req, res) => {
  try {
    const callbackURL = `${getApiUrl()}/api/auth/google/callback`;
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(callbackURL)}&` +
      `scope=profile email&` +
      `response_type=code&` +
      `access_type=offline`;
    
    res.json({
      authUrl: authUrl,
      message: 'Test OAuth URL - try visiting this URL directly'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test OAuth configuration with detailed info
router.get('/test-config', (req, res) => {
  const callbackURL = `${getApiUrl()}/api/auth/google/callback`;
  
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'Not set',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...' : 'Not set',
    callbackURL: callbackURL,
    message: 'OAuth configuration test - check if clientId matches your Google OAuth client'
  });
});

// Google OAuth routes with error handling
router.get('/google', (req, res, next) => {
  console.log('Starting Google OAuth flow...');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  console.log('Google OAuth callback received');
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  // Ensure protocol is included
  if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
    frontendUrl = `https://${frontendUrl}`;
  }
  passport.authenticate('google', { 
    failureRedirect: `${frontendUrl}?error=auth_failed`,
    session: false 
  })(req, res, next);
}, (req, res) => {
  try {
    console.log('OAuth callback successful, user:', req.user);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    console.log('JWT token generated for user:', req.user.email);
    
    // Redirect directly to dashboard with token
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Ensure protocol is included
    if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
      frontendUrl = `https://${frontendUrl}`;
    }
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  } catch (error) {
    console.error('Token generation error:', error);
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Ensure protocol is included
    if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
      frontendUrl = `https://${frontendUrl}`;
    }
    res.redirect(`${frontendUrl}?error=auth_failed`);
  }
});

// Handle the oauth-handler.html redirect
router.get('/oauth-handler', (req, res) => {
  // This will be called by Google OAuth
  res.redirect(`${getApiUrl()}/api/auth/google/callback`);
});

// Handle OAuth callback from HTML file
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    // Here you would exchange the code for tokens with Google
    // For now, let's create a mock user for demonstration
    const mockUser = {
      _id: 'mock-user-id-' + Date.now(),
      googleId: 'mock-google-id',
      email: 'user@example.com',
      name: 'Test User'
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: mockUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Handle OAuth errors and provide demo fallback
router.get('/demo-fallback', (req, res) => {
  // Generate a demo token
  const demoToken = jwt.sign(
    { userId: 'demo-user-' + Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  // Ensure protocol is included
  if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
    frontendUrl = `https://${frontendUrl}`;
  }
  res.redirect(`${frontendUrl}/dashboard?token=${demoToken}`);
});

// Exchange authorization code for token
router.post('/exchange-token', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    // Exchange the authorization code for access token with Google
    const callbackURL = `${getApiUrl()}/api/auth/google/callback`;
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: callbackURL
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token from Google');
    }

    // Get user profile from Google
    const profileResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
    const profile = await profileResponse.json();

    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // Update existing user
      user.email = profile.email;
      user.name = profile.name;
      user.profilePicture = profile.picture;
      await user.save();
    } else {
      // Create new user
      user = new User({
        googleId: profile.id,
        email: profile.email,
        name: profile.name,
        profilePicture: profile.picture,
        preferences: {
          style: 'casual',
          colors: [],
          brands: []
        },
        wardrobe: [],
        outfits: []
      });
      
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({ 
      valid: true, 
      userId: decoded.userId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
