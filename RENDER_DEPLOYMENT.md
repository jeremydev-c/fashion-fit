# 🚀 Deploy Backend to Render (Free Alternative)

Since Railway has limited access, let's use **Render** for the backend (completely free! 🎉)

---

## 📋 Step-by-Step Guide

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with **GitHub** (free)
3. Click **"New +"** → **"Web Service"**

### Step 2: Connect GitHub Repository
1. Select **"Connect GitHub"**
2. Authorize Render to access your repos
3. Search for `fashion-fit` repository
4. Click **"Connect"**

### Step 3: Configure Web Service
Fill in these settings:

- **Name**: `fashion-fit-backend` (or any name you like)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 4: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**, then add:

```env
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://fashion-fit-vert.vercel.app
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_random_string_min_32_chars
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Important Notes:**
- Replace all `your_*` values with your actual credentials
- `PORT=10000` is Render's default (or let Render auto-detect)
- `FRONTEND_URL` should be your Vercel URL

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Render will start building (takes 3-5 minutes)
3. Once deployed, you'll get a URL like: `https://fashion-fit-backend.onrender.com`

### Step 6: Set Vercel Environment Variable
1. Go to **Vercel** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-render-url.onrender.com` (your Render backend URL)
   - **Environments**: Production, Preview, Development
3. Click **Save**
4. **Redeploy**: Go to Deployments → Latest → **⋯** → **Redeploy**

### Step 7: Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. **Authorized redirect URIs**, add:
   ```
   https://your-render-url.onrender.com/api/auth/google/callback
   ```
5. Click **Save**

### Step 8: Update Backend with Frontend URL
1. Go back to **Render** → Your Service → **Environment**
2. Update `FRONTEND_URL` to your Vercel URL: `https://fashion-fit-vert.vercel.app`
3. Render will auto-redeploy

---

## ✅ Verify Deployment

### Test Backend:
Visit: `https://your-render-url.onrender.com/api/health`
Should return: `{"status":"OK","message":"Fashion Fit API is running!"}`

### Test Frontend:
1. Visit: `https://fashion-fit-vert.vercel.app`
2. Click **"Get Started"**
3. Should redirect to Google OAuth, then back to dashboard

---

## 🔄 Free Tier Limits (Render)

- **Free tier**: 750 hours/month (enough for 24/7!)
- **Spins down** after 15 minutes of inactivity (first request takes ~30 seconds to wake up)
- **Can upgrade** to paid plan to keep it always-on ($7/month)

---

## 🎉 You're Done!

- **Frontend**: `https://fashion-fit-vert.vercel.app` (Vercel)
- **Backend**: `https://your-backend.onrender.com` (Render)

Both are free and working! 🚀

---

## 🐛 Troubleshooting

### Backend not responding?
- Check Render logs: Render Dashboard → Your Service → **Logs**
- Verify all environment variables are set
- Check if service is "Live" (not sleeping)

### OAuth not working?
- Verify Google OAuth redirect URI matches Render URL exactly
- Check Render logs for OAuth errors
- Ensure `FRONTEND_URL` in Render matches your Vercel URL

### CORS errors?
- Make sure `FRONTEND_URL` in Render = your exact Vercel URL
- Check backend `server.js` CORS configuration

