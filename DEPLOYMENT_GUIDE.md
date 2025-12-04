# 🚀 FTEAT Deployment Guide

## Overview
- **Frontend (Next.js):** Deploy to Vercel
- **Backend (Express.js):** Deploy to Railway
- **Database:** MongoDB Atlas (already configured)

---

## Part 1: Deploy Backend to Railway 🚂

### Step 1: Prepare Backend
1. Make sure `backend/package.json` has correct start script:
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```

2. Check `backend/server.js` uses environment PORT:
   ```javascript
   const PORT = process.env.PORT || 5000;
   ```

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository
6. Select **`backend`** folder as root directory
7. Railway will auto-detect Node.js

### Step 3: Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=FTEAT <your_email@gmail.com>

# Frontend URL (will update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Cloudinary (if using image upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Get Backend URL
After deployment, Railway will provide a URL like:
```
https://your-backend.up.railway.app
```
**Save this URL!** You'll need it for frontend.

---

## Part 2: Deploy Frontend to Vercel ▲

### Step 1: Prepare Frontend

1. Create `fteat_uas_frontend/.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
   ```

2. Update `fteat_uas_frontend/next.config.js`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     images: {
       domains: ['res.cloudinary.com', 'localhost'],
       unoptimized: true
     },
     env: {
       NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
     }
   }

   module.exports = nextConfig
   ```

3. Check `package.json` has correct build script:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start"
   }
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `fteat_uas_frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Step 3: Configure Environment Variables
In Vercel dashboard, go to **Settings → Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete
3. You'll get a URL like: `https://your-app.vercel.app`

---

## Part 3: Update CORS & Frontend URL 🔄

### Update Backend CORS
Go back to Railway dashboard and update `FRONTEND_URL`:
```env
FRONTEND_URL=https://your-app.vercel.app
```

Railway will auto-redeploy.

### Verify `backend/server.js` CORS config:
```javascript
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## Part 4: Testing 🧪

### Test Backend
```bash
curl https://your-backend.up.railway.app/api/health
```

### Test Frontend
1. Visit `https://your-app.vercel.app`
2. Try login
3. Check browser console for API errors
4. Verify all features work

---

## Common Issues & Solutions 🔧

### Issue 1: CORS Error
**Solution:** Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly.

### Issue 2: API Not Found
**Solution:** Check `NEXT_PUBLIC_API_URL` in Vercel environment variables.

### Issue 3: Database Connection Failed
**Solution:** 
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check `MONGO_URI` is correct

### Issue 4: Images Not Loading
**Solution:** Add Cloudinary domain to `next.config.js`:
```javascript
images: {
  domains: ['res.cloudinary.com']
}
```

### Issue 5: Build Failed on Vercel
**Solution:**
- Check all dependencies are in `package.json`
- Run `npm run build` locally first
- Check build logs in Vercel dashboard

---

## Environment Variables Checklist ✅

### Railway (Backend)
- [ ] NODE_ENV
- [ ] MONGO_URI
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] EMAIL_HOST
- [ ] EMAIL_PORT
- [ ] EMAIL_USER
- [ ] EMAIL_PASS
- [ ] EMAIL_FROM
- [ ] FRONTEND_URL
- [ ] CLOUDINARY_CLOUD_NAME (optional)
- [ ] CLOUDINARY_API_KEY (optional)
- [ ] CLOUDINARY_API_SECRET (optional)

### Vercel (Frontend)
- [ ] NEXT_PUBLIC_API_URL

---

## Monitoring 📊

### Railway
- View logs: Railway Dashboard → Deployments → Logs
- Monitor metrics: CPU, Memory, Network

### Vercel
- View logs: Vercel Dashboard → Deployments → Function Logs
- Monitor analytics: Vercel Analytics

---

## Custom Domain (Optional) 🌐

### Railway
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

### Vercel
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

---

## Rollback 🔄

### Railway
1. Go to Deployments
2. Select previous deployment
3. Click "Redeploy"

### Vercel
1. Go to Deployments
2. Find previous deployment
3. Click "Promote to Production"

---

## Support 💬

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test API endpoints manually
4. Check browser console for errors

**Developed by HELD Team** 🚀
