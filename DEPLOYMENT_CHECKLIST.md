# 🚀 Fashion Fit Deployment Checklist

## 📋 Pre-Deployment Checklist

### Backend (Railway) Setup
- [ ] Railway account created (railway.app)
- [ ] MongoDB Atlas cluster ready (mongodb.com/cloud/atlas)
- [ ] Google OAuth credentials created (console.cloud.google.com)
- [ ] Cloudinary account ready (cloudinary.com)
- [ ] All environment variables ready (see below)

### Frontend (Vercel) Setup
- [ ] Vercel account created (vercel.com)
- [ ] GitHub repository pushed and up-to-date
- [ ] Backend URL ready (will get from Railway)

---

## 🔧 Step-by-Step Deployment

### Step 1: Deploy Backend to Railway

1. **Go to Railway**
   - Visit: https://railway.app
   - Sign up/login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `fashion-fit` repository

2. **Configure Service**
   - Railway should auto-detect Node.js
   - **IMPORTANT**: Set **Root Directory** to `backend`
   - Railway will use `railway.json` automatically

3. **Add Environment Variables**
   In Railway Dashboard → Your Service → Variables, add:

   ```
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_min_32_chars
   JWT_EXPIRE=7d
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   **Note**: Leave `FRONTEND_URL` as placeholder for now, update after Vercel deployment

4. **Get Backend URL**
   - After deployment, Railway provides: `https://your-app.up.railway.app`
   - **Save this URL!** ✅

5. **Test Backend**
   - Visit: `https://your-app.up.railway.app/api/health`
   - Should return: `{"status":"OK","message":"Fashion Fit API is running!"}`

---

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import `fashion-fit` repository

2. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT**
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)

3. **Add Environment Variables**
   In Vercel Dashboard → Project → Settings → Environment Variables:

   ```
   NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key (optional)
   NEXT_PUBLIC_ENABLE_SMART_CAMERA=false (optional)
   ```

   **Note**: Use the Railway backend URL from Step 1!

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Vercel provides: `https://your-app.vercel.app`

5. **Get Frontend URL**
   - **Save this URL!** ✅

---

### Step 3: Link Frontend & Backend

1. **Update Railway `FRONTEND_URL`**
   - Go back to Railway
   - Update `FRONTEND_URL` to your Vercel URL
   - Railway will auto-redeploy

2. **Update Google OAuth Redirect URI**
   - Go to Google Cloud Console
   - Edit your OAuth 2.0 credentials
   - Add authorized redirect URI:
     ```
     https://your-backend.up.railway.app/api/auth/google/callback
     ```

---

### Step 4: Verify Everything Works

- [ ] Backend health check: `https://your-backend.up.railway.app/api/health` ✅
- [ ] Frontend loads: `https://your-app.vercel.app` ✅
- [ ] Google sign-in works ✅
- [ ] API calls succeed (check browser console) ✅
- [ ] Images upload to Cloudinary ✅

---

## 🐛 Troubleshooting

### Backend Issues
- **Check Railway logs**: Dashboard → Deployments → View Logs
- **Verify env vars**: All required variables set?
- **MongoDB connection**: Whitelist Railway IPs (or use `0.0.0.0/0`)

### Frontend Issues
- **Check Vercel logs**: Dashboard → Deployments → View Logs
- **API URL correct?**: Verify `NEXT_PUBLIC_API_URL` matches Railway URL
- **CORS errors?**: Ensure `FRONTEND_URL` in Railway matches Vercel URL exactly

### OAuth Issues
- **Redirect URI mismatch**: Must be exactly: `https://your-backend.up.railway.app/api/auth/google/callback`
- **Check Google Console**: Credentials active and authorized redirects set

---

## ✅ Success Criteria

When everything works:
- ✅ Frontend loads without errors
- ✅ Google OAuth login works
- ✅ User can upload wardrobe items
- ✅ Images display correctly (Cloudinary)
- ✅ Recommendations page loads
- ✅ Fashion Stylist chat works
- ✅ Profile page shows user data

---

## 📝 Quick Reference

**Backend URL**: `https://your-app.up.railway.app`  
**Frontend URL**: `https://your-app.vercel.app`  
**Health Check**: `/api/health`

**Important Files**:
- `backend/railway.json` - Railway config
- `backend/Procfile` - Start command
- `frontend/vercel.json` - Vercel config
- `backend/server.js` - Main server file

---

## 🎉 You're Live!

Once verified, your Fashion Fit app is production-ready! 🚀

