# 🚀 Deployment Guide: Fashion Fit

This guide will help you deploy Fashion Fit to **Vercel** (Frontend) and **Railway** (Backend).

---

## 📋 Prerequisites

- GitHub account with your Fashion Fit repository
- MongoDB Atlas account (free tier available)
- Google OAuth credentials
- Cloudinary account (for image storage)
- OpenAI API key (optional, for Smart Camera)

---

## 🎯 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `fashion-fit` repository

### Step 2: Configure Railway Service
1. Railway will detect Node.js automatically
2. Set the **Root Directory** to `backend`
3. Railway will use the `railway.json` config file

### Step 3: Add Environment Variables
In Railway dashboard, add these environment variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (will be set after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_super_secret_random_string_min_32_chars
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Get Railway Backend URL
1. After deployment, Railway will provide a URL like: `https://your-app.up.railway.app`
2. **Save this URL** - you'll need it for Vercel

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your `fashion-fit` repository

### Step 2: Configure Vercel Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)

### Step 3: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

```env
# Backend API URL (from Railway)
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app

# Optional: OpenAI for Smart Camera
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key

# Optional: Enable Smart Camera (default: false)
NEXT_PUBLIC_ENABLE_SMART_CAMERA=false
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. Vercel will provide a URL like: `https://your-app.vercel.app`

### Step 5: Update Railway with Frontend URL
1. Go back to Railway
2. Update `FRONTEND_URL` environment variable to your Vercel URL
3. Redeploy Railway service

---

## 🔐 Part 3: Configure OAuth & Services

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-backend.up.railway.app/api/auth/google/callback`
4. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Railway

### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier: M0)
3. Create database user
4. Whitelist Railway IP (or use `0.0.0.0/0` for all IPs)
5. Get connection string and update `MONGODB_URI` in Railway

### Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com)
2. Create free account
3. Get cloud name, API key, and API secret
4. Update in Railway environment variables

---

## ✅ Part 4: Verify Deployment

### Backend Health Check
Visit: `https://your-backend.up.railway.app/api/health`
Should return: `{"status":"OK","message":"Fashion Fit API is running!"}`

### Frontend
Visit: `https://your-app.vercel.app`
- Should load the home page
- Try signing in with Google
- Check if API calls work

### Troubleshooting
- Check Railway logs: Railway Dashboard → Deployments → View Logs
- Check Vercel logs: Vercel Dashboard → Deployments → View Logs
- Verify all environment variables are set correctly
- Ensure CORS is properly configured (Frontend URL in Railway)

---

## 🔄 Updating Your Deployment

### After pushing to GitHub:
1. **Railway**: Automatically redeploys on push to `main`
2. **Vercel**: Automatically redeploys on push to `main`

### Manual redeploy:
- Railway: Dashboard → Deployments → Redeploy
- Vercel: Dashboard → Deployments → Redeploy

---

## 📝 Important Notes

1. **CORS**: Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. **Environment Variables**: Use `NEXT_PUBLIC_` prefix for frontend env vars in Vercel
3. **MongoDB**: Whitelist Railway IPs or use `0.0.0.0/0` (less secure but easier)
4. **HTTPS**: Both Railway and Vercel provide HTTPS automatically
5. **Domain**: You can add custom domains in both platforms

---

## 🎉 You're Done!

Your Fashion Fit app is now live! 🚀

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.up.railway.app`

