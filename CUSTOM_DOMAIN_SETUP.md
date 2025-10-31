# 🌐 Custom Domain Setup: modenova.co.ke

This guide shows how to use your custom domain `modenova.co.ke` with Fashion Fit.

---

## 🎯 Domain Configuration Options

### Option 1: Main Domain for Frontend (Recommended)
- **Frontend**: `modenova.co.ke` (or `www.modenova.co.ke`)
- **Backend**: `api.modenova.co.ke` (subdomain) OR Railway default URL

### Option 2: Subdomain Setup
- **Frontend**: `app.modenova.co.ke` or `fashion.modenova.co.ke`
- **Backend**: `api.modenova.co.ke`

---

## 📋 Step-by-Step Setup

### Step 1: Configure Domain on Vercel (Frontend)

1. **Add Domain in Vercel**
   - Go to your Vercel project → Settings → Domains
   - Add domain: `modenova.co.ke` (or `www.modenova.co.ke`)
   - Vercel will show DNS records to add

2. **DNS Configuration**
   Add these DNS records in your domain registrar (where you bought modenova.co.ke):

   **For Root Domain (modenova.co.ke)**:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: Auto
   ```

   **OR Use CNAME**:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

   **For www subdomain**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

3. **Wait for SSL**
   - Vercel automatically provisions SSL (HTTPS)
   - Usually takes 1-24 hours
   - Check status in Vercel dashboard

---

### Step 2: Configure Backend Domain (Optional but Recommended)

#### Option A: Use Railway's Default Domain
- Keep using: `https://your-app.up.railway.app`
- Simpler setup
- Still works perfectly!

#### Option B: Use Custom Subdomain (api.modenova.co.ke)

1. **In Railway Dashboard**
   - Go to your service → Settings → Networking
   - Click "Generate Domain" or use existing
   - Railway provides a domain like: `your-app.up.railway.app`

2. **Add DNS Record**
   In your domain registrar, add:
   ```
   Type: CNAME
   Name: api
   Value: your-app.up.railway.app
   TTL: Auto
   ```

3. **Update Railway**
   - Railway will detect the CNAME
   - SSL will auto-provision

---

### Step 3: Update Environment Variables

#### In Railway (Backend):
```
FRONTEND_URL=https://modenova.co.ke,https://www.modenova.co.ke
```

(Add both root and www if you use both)

#### In Vercel (Frontend):
```
NEXT_PUBLIC_API_URL=https://api.modenova.co.ke
```
OR if using Railway default:
```
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

---

### Step 4: Update Google OAuth

1. **Go to Google Cloud Console**
   - Edit your OAuth 2.0 credentials
   - Update Authorized redirect URIs:

   **If using Railway default backend**:
   ```
   https://your-app.up.railway.app/api/auth/google/callback
   ```

   **If using custom backend domain**:
   ```
   https://api.modenova.co.ke/api/auth/google/callback
   ```

2. **Update Authorized JavaScript origins** (if needed):
   ```
   https://modenova.co.ke
   https://www.modenova.co.ke
   ```

---

### Step 5: Update MongoDB Atlas (if needed)

If you have IP whitelisting:
- Whitelist Railway's IPs OR
- Use `0.0.0.0/0` (allows all IPs - less secure but easier)

---

### Step 6: Verify Everything Works

1. **Frontend**: Visit `https://modenova.co.ke`
2. **Backend**: Visit `https://api.modenova.co.ke/api/health` (or Railway URL)
3. **Test OAuth**: Try Google sign-in
4. **Check Console**: No CORS errors

---

## 🔧 DNS Configuration Example

If your domain registrar is:
- **Namecheap**: DNS → Advanced DNS → Add records
- **GoDaddy**: DNS Management → Add records
- **Cloudflare**: DNS → Add record (use "Proxied" for Cloudflare protection)

**Records to add**:
```
A     @     76.76.21.21          (Vercel root domain)
CNAME www   cname.vercel-dns.com (Vercel www)
CNAME api   your-app.up.railway.app (Backend API)
```

---

## ⚠️ Important Notes

1. **DNS Propagation**: Changes can take 24-48 hours (usually faster)
2. **SSL Certificates**: Auto-provisioned by Vercel/Railway
3. **CORS**: Make sure `FRONTEND_URL` in Railway includes all domain variants
4. **HTTPS Required**: Both services require HTTPS in production
5. **www vs root**: Choose one as primary, redirect other (Vercel can auto-redirect)

---

## 🐛 Troubleshooting

### Domain Not Working?
- Check DNS propagation: https://dnschecker.org
- Verify records are correct in your registrar
- Wait 24 hours if recently added

### SSL Issues?
- Vercel/Railway auto-provisions SSL
- If issues, check domain verification in dashboard

### CORS Errors?
- Verify `FRONTEND_URL` in Railway includes your domain
- Check exact URL (with/without www, https)
- Check browser console for exact error

---

## ✅ Quick Checklist

- [ ] Domain added in Vercel
- [ ] DNS records added in registrar
- [ ] Backend domain configured (Railway or custom)
- [ ] Environment variables updated
- [ ] Google OAuth redirect URIs updated
- [ ] Test domain loads correctly
- [ ] Test OAuth login works
- [ ] SSL certificates active (HTTPS working)

---

## 🎉 You're Done!

Your Fashion Fit app is now live on `modenova.co.ke`! 🚀

**Live URLs**:
- Frontend: `https://modenova.co.ke`
- Backend: `https://api.modenova.co.ke` (or Railway URL)

