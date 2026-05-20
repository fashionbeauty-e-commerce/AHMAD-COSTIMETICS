# Ahmad Costimetics - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Stripe account
- Cloudinary account (optional, for image hosting)
- Domain name (optional)

---

## 1. Backend Deployment (Railway/Render)

### Railway.app

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Railway**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Set Environment Variables**
   In Railway dashboard, add all variables from `.env.example`:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_production_jwt_secret
   ADMIN_EMAILS=fashionbeauty101f@gmail.com,konkcee@gmail.com
   STRIPE_SECRET_KEY=sk_live_...
   CLOUDINARY_CLOUD_NAME=...
   ```

4. **Deploy**
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://your-app.railway.app`

### Render.com

1. **Create New Web Service**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo

2. **Configuration**
   ```
   Name: ahmad-ecommerce-api
   Environment: Node
   Build Command: npm install
   Start Command: node server/index.js
   ```

3. **Add Environment Variables**
   - Same as Railway

---

## 2. Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel login
vercel --prod
```

3. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_CLERK_PUBLISHABLE_KEY=...
   VITE_FIREBASE_* (all firebase vars)
   ```

4. **Custom Domain (Optional)**
   - Go to Vercel project settings
   - Add your domain
   - Update DNS records

---

## 3. MongoDB Atlas Setup

1. **Create Cluster**
   - Go to https://cloud.mongodb.com
   - Create free cluster (M0)
   - Choose region closest to your users

2. **Create Database User**
   - Database Access → Add New Database User
   - Username: `ahmad_admin`
   - Password: (generate strong password)
   - Role: Read and write to any database

3. **Whitelist IP**
   - Network Access → Add IP Address
   - For development: Add Current IP
   - For production: Add `0.0.0.0/0` (allow all)

4. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your password
   - Add to `.env` as `MONGODB_URI`

---

## 4. Stripe Setup

1. **Create Account**
   - Go to https://stripe.com
   - Create account

2. **Get API Keys**
   - Developers → API Keys
   - Copy Publishable key and Secret key
   - Add to `.env`

3. **Setup Webhooks (Production)**
   - Developers → Webhooks → Add endpoint
   - URL: `https://your-backend.railway.app/api/payments/webhook`
   - Events to listen:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

---

## 5. Cloudinary Setup (Image Storage)

1. **Create Account**
   - Go to https://cloudinary.com
   - Sign up for free plan

2. **Get Credentials**
   - Settings → API Keys
   - Copy Cloud Name, API Key, API Secret
   - Add to `.env`

---

## 6. Firebase Setup (Realtime Chat)

1. **Create Project**
   - Go to https://console.firebase.google.com
   - Create new project: `ahmad-costimetics`

2. **Enable Firestore**
   - Build → Firestore Database → Create database
   - Start in test mode

3. **Get Config**
   - Project Settings → General
   - Scroll to "Your apps"
   - Add web app
   - Copy config to `.env`

---

## 7. Email Setup (Gmail)

1. **Enable 2FA**
   - Go to Google Account settings
   - Security → 2-Step Verification → Enable

2. **Create App Password**
   - Security → App passwords
   - Select "Mail" and your device
   - Copy generated password
   - Add to `EMAIL_PASSWORD` in `.env`

---

## 8. Production Checklist

### Security
- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Update CORS origins
- [ ] Enable rate limiting
- [ ] Set up SSL certificates

### Database
- [ ] Create MongoDB backups
- [ ] Set up indexes
- [ ] Configure connection pooling

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Enable logging
- [ ] Monitor server health

### Performance
- [ ] Enable compression
- [ ] Set up CDN for images
- [ ] Configure caching

---

## 9. Start Server

### Development
```bash
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

### Production
```bash
npm install
npm run build
npm start
```

---

## 10. Admin Setup

1. **Create First Admin**
   - Register account with admin email
   - System automatically grants admin access based on `ADMIN_EMAILS`

2. **Access Dashboard**
   - Login at `/sign-in`
   - Click "Admin" button in header
   - Dashboard URL: `/admin`

---

## 11. Testing Payment Flow

1. **Test Mode (Stripe)**
   - Use test card: `4242 4242 4242 4242`
   - Any future date
   - Any CVC

2. **Mobile Money Test**
   - Upload test payment proof
   - Admin approves in dashboard
   - Order status updates

---

## 12. Troubleshooting

### Connection Issues
```bash
# Check MongoDB connection
mongo --version
# Test connection string

# Check server logs
tail -f logs/error.log
```

### Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

---

## 13. Support

- **Email**: support@ahmadcostimetics.com
- **Documentation**: See README.md
- **API Docs**: `/api/health` endpoint

---

**Deployment Complete! 🎉**

Your ecommerce platform is now live and ready for customers!
