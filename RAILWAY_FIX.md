# 🔧 Railway Deployment Fix - Monorepo Issue

## Problem
```
Error: Cannot find module 'express'
```

Railway was trying to run from root but dependencies are in `backend/` folder.

## Solution Applied ✅

### 1. Added `railway.toml`
This tells Railway how to build and run the backend:
```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd backend && npm ci"

[deploy]
startCommand = "cd backend && npm start"
```

### 2. Updated Root `package.json`
Added postinstall script to install backend dependencies:
```json
"scripts": {
  "postinstall": "cd backend && npm install",
  "start": "cd backend && npm start"
}
```

## How to Fix Your Deployment

### Option A: Redeploy (Automatic)
1. Push the new changes to GitHub:
   ```bash
   git add .
   git commit -m "Fix Railway monorepo deployment"
   git push origin main
   ```
2. Railway will auto-redeploy with the new configuration
3. Check logs - should see "Server running on port..."

### Option B: Manual Railway Settings
If auto-redeploy doesn't work:

1. Go to Railway Dashboard
2. Click on your project
3. Go to **Settings**
4. Under **Build**, set:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
5. Click **"Redeploy"**

## Verify Deployment

### Check Logs
In Railway dashboard, go to **Deployments** → **View Logs**

Should see:
```
✅ Installing dependencies...
✅ Server running on port 5000
✅ MongoDB connected successfully
```

### Test Backend
Open in browser:
```
https://your-backend.up.railway.app
```

Should see: "FTEAT Backend API is running"

## Common Issues

### Issue: Still getting MODULE_NOT_FOUND
**Solution:** 
1. Check `railway.toml` is in root directory
2. Redeploy manually from Railway dashboard

### Issue: Build timeout
**Solution:**
1. Railway free tier has 500MB memory limit
2. Make sure `node_modules` is in `.gitignore`
3. Use `npm ci` instead of `npm install` (faster)

### Issue: Environment variables not working
**Solution:**
1. Check all env vars are set in Railway dashboard
2. No quotes around values
3. Redeploy after adding env vars

## Files Added/Modified

✅ `railway.toml` - Railway configuration
✅ `railway.json` - Alternative configuration (backup)
✅ `package.json` - Added postinstall script
✅ `QUICK_DEPLOY.md` - Updated instructions

## Next Steps

1. ✅ Push changes to GitHub
2. ✅ Wait for Railway auto-redeploy (~2-3 min)
3. ✅ Check deployment logs
4. ✅ Test backend URL
5. ✅ Continue with Vercel deployment

---

**Developed by HELD Team** 🚀
