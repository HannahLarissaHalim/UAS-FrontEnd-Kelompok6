# ✅ Deployment Checklist - FTEAT

## Pre-Deployment

### Code Ready
- [ ] All features tested locally
- [ ] No console errors
- [ ] All dependencies in package.json
- [ ] Environment variables documented
- [ ] Git repository up to date

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access: Allow from anywhere (0.0.0.0/0)
- [ ] Connection string copied

### Email Setup (Gmail)
- [ ] Gmail account ready
- [ ] 2-Factor Authentication enabled
- [ ] App Password generated
- [ ] Email credentials ready

---

## Railway Deployment (Backend)

### Setup
- [ ] Railway account created
- [ ] GitHub connected to Railway
- [ ] Repository imported
- [ ] Root directory set to `backend`

### Environment Variables
- [ ] NODE_ENV=production
- [ ] MONGO_URI (from MongoDB Atlas)
- [ ] JWT_SECRET (random string)
- [ ] JWT_EXPIRE=7d
- [ ] EMAIL_HOST=smtp.gmail.com
- [ ] EMAIL_PORT=587
- [ ] EMAIL_USER (your Gmail)
- [ ] EMAIL_PASS (App Password)
- [ ] EMAIL_FROM
- [ ] FRONTEND_URL (will update later)

### Verification
- [ ] Deployment successful
- [ ] Backend URL copied
- [ ] Health check endpoint works
- [ ] Logs show no errors

---

## Vercel Deployment (Frontend)

### Setup
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Repository imported
- [ ] Root directory set to `fteat_uas_frontend`
- [ ] Framework detected as Next.js

### Environment Variables
- [ ] NEXT_PUBLIC_API_URL (Railway backend URL)

### Verification
- [ ] Build successful
- [ ] Frontend URL copied
- [ ] Homepage loads
- [ ] No build warnings

---

## Post-Deployment

### Update Backend
- [ ] FRONTEND_URL updated in Railway
- [ ] Railway redeployed automatically
- [ ] CORS working

### Testing
- [ ] Homepage loads ✅
- [ ] Login works (Mahasiswa) ✅
- [ ] Login works (Vendor) ✅
- [ ] Login works (Admin) ✅
- [ ] Register works ✅
- [ ] Menu page loads ✅
- [ ] Cart functionality ✅
- [ ] Payment flow ✅
- [ ] Order history ✅
- [ ] Profile update ✅
- [ ] Vendor features ✅
- [ ] Admin features ✅
- [ ] Email notifications ✅
- [ ] Image uploads ✅
- [ ] Responsive design ✅

### Performance
- [ ] Page load time < 3s
- [ ] API response time < 1s
- [ ] No memory leaks
- [ ] No console errors

---

## URLs to Document

```
Production Frontend: ___________________________
Production Backend:  ___________________________
MongoDB Atlas:       ___________________________
Railway Dashboard:   ___________________________
Vercel Dashboard:    ___________________________
```

---

## Rollback Plan

### If Frontend Breaks
1. Go to Vercel Dashboard
2. Deployments → Previous deployment
3. Click "Promote to Production"

### If Backend Breaks
1. Go to Railway Dashboard
2. Deployments → Previous deployment
3. Click "Redeploy"

---

## Monitoring

### Daily Checks
- [ ] Check Railway logs for errors
- [ ] Check Vercel analytics
- [ ] Monitor MongoDB Atlas metrics
- [ ] Test critical user flows

### Weekly Checks
- [ ] Review error logs
- [ ] Check database size
- [ ] Monitor API usage
- [ ] Update dependencies if needed

---

## Emergency Contacts

```
Team Lead:     _________________________
Backend Dev:   _________________________
Frontend Dev:  _________________________
Database Admin: _________________________
```

---

## Notes

```
Deployment Date: _________________________
Deployed By:     _________________________
Version:         _________________________
Special Notes:   _________________________
                 _________________________
```

---

**Developed by HELD Team** 🚀
