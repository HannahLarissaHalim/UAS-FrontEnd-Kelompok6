# 🔧 Vercel Build Fix - Root Directory Issue

## Problem
Build fails or 404 error because Vercel trying to build from root instead of `fteat_uas_frontend` folder.

## Solution

### Step 1: Go to Project Settings
1. Vercel Dashboard → Your Project (`fteatuntar.fe`)
2. Click **"Settings"** tab
3. Scroll to **"Build & Development Settings"**

### Step 2: Set Root Directory
1. Find **"Root Directory"** section
2. Click **"Edit"**
3. Enter: `fteat_uas_frontend`
4. Click **"Save"**

### Step 3: Add Environment Variable (if not yet)
1. Go to **"Environment Variables"** section
2. Click **"Add New"**
3. **Name:** `NEXT_PUBLIC_API_URL`
4. **Value:** `https://fteatuntarproduction.up.railway.app`
5. **Environment:** Production, Preview, Development (select all)
6. Click **"Save"**

### Step 4: Redeploy
1. Go to **"Deployments"** tab
2. Click latest deployment
3. Click **"Redeploy"** button (top right)
4. Wait 2-3 minutes

## Verify Settings

### Build & Development Settings Should Be:
```
Framework Preset: Next.js
Root Directory: fteat_uas_frontend
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Environment Variables Should Have:
```
NEXT_PUBLIC_API_URL = https://fteatuntarproduction.up.railway.app
```

## Test Deployment

After successful build:
```
https://fteatuntar-fe.vercel.app
```

Should redirect to:
```
https://fteatuntar-fe.vercel.app/home
```

## Common Errors

### Error: "No Next.js build found"
**Fix:** Root Directory not set. Follow Step 2 above.

### Error: "Module not found"
**Fix:** Check `package.json` in `fteat_uas_frontend` folder has all dependencies.

### Error: "API calls failing"
**Fix:** Check `NEXT_PUBLIC_API_URL` environment variable is set correctly.

---

**Developed by HELD Team** 🚀
