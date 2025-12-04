# 🚀 Quick Deploy Guide - FTEAT

## Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- Vercel account (sign up at vercel.com)
- MongoDB Atlas database

---

## 🚂 Step 1: Deploy Backend to Railway (5 minutes)

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 1.2 Deploy on Railway
1. Go to **https://railway.app**
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. **Important:** Railway will auto-detect the monorepo
   - If asked, keep root directory as `/` (root)
   - The `railway.toml` file will handle the backend setup
6. Click **"Deploy"**

### 1.3 Add Environment Variables
Click **"Variables"** tab and add:
```
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=FTEAT <your_email@gmail.com>
FRONTEND_URL=https://your-app.vercel.app
```

### 1.4 Get Backend URL
After deployment, copy the URL:
```
https://your-backend-xxx.up.railway.app
```

---

## ▲ Step 2: Deploy Frontend to Vercel (5 minutes)

### 2.1 Deploy on Vercel
1. Go to **https://vercel.com**
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **Important:** Set root directory to `fteat_uas_frontend`
5. Framework: **Next.js** (auto-detected)

### 2.2 Add Environment Variable
In **Environment Variables** section:
```
NEXT_PUBLIC_API_URL=https://your-backend-xxx.up.railway.app
```

### 2.3 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Copy your Vercel URL:
```
https://your-app.vercel.app
```

---

## 🔄 Step 3: Update Backend with Frontend URL

1. Go back to **Railway dashboard**
2. Click **"Variables"**
3. Update `FRONTEND_URL`:
```
FRONTEND_URL=https://your-app.vercel.app
```
4. Railway will auto-redeploy

---

## ✅ Step 4: Test Your Deployment

### Test Backend
Open in browser:
```
https://your-backend-xxx.up.railway.app
```
Should see: "FTEAT Backend API is running"

### Test Frontend
Open in browser:
```
https://your-app.vercel.app
```
Should see: FTEAT homepage

### Test Login
1. Go to Login page
2. Try logging in
3. Check if API calls work

---

## 🐛 Troubleshooting

### CORS Error?
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- No trailing slash!

### API Not Found?
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Make sure it points to Railway backend URL

### Build Failed?
- Check build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`

### Database Connection Failed?
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Verify `MONGO_URI` is correct

---

## 📝 Important URLs to Save

```
Backend (Railway): https://your-backend-xxx.up.railway.app
Frontend (Vercel): https://your-app.vercel.app
MongoDB Atlas: https://cloud.mongodb.com
```

---

## 🎉 Done!

Your FTEAT app is now live! Share the Vercel URL with your team.

**Developed by HELD Team** 🚀
