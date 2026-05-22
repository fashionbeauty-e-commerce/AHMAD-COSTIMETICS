# 🌥️ Cloudinary Storage Setup Guide

Complete guide to setting up Cloudinary for Ahmad Costimetics ecommerce platform.

## ✅ What's Already Implemented

- ✅ Cloudinary service (`src/services/cloudinary.ts`)
- ✅ Reusable image uploader component (`src/components/ImageUploader.tsx`)
- ✅ Drag & drop file upload with progress tracking
- ✅ Multi-file upload support
- ✅ File validation (size, type)
- ✅ Image optimization helpers
- ✅ Folder organization (products, categories, banners, payments, chat, profiles)
- ✅ Backend deletion API (`server/routes/upload.js`)
- ✅ Integrated in Chat Widget (image attachments)
- ✅ Mobile responsive uploader

---

## 📋 Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up (free tier: 25GB storage, 25GB bandwidth/month)
3. Verify your email

---

## 🔑 Step 2: Get Your Credentials

1. Log in to https://cloudinary.com/console
2. On the dashboard, find your credentials:
   - **Cloud Name**: e.g., `dxxxxxxx`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abcdef1234567890_xxxxxxxxxxx`

---

## ⚙️ Step 3: Create Upload Preset

1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Configure:
   - **Preset name**: `ahmad_costimetics`
   - **Signing Mode**: ⚠️ **Unsigned** (allows frontend uploads)
   - **Folder**: `ahmad-costimetics` (auto-organize)
4. Optional advanced settings:
   - **Allowed formats**: jpg, png, webp, gif
   - **Max file size**: 10485760 (10MB)
   - **Eager transformations**: 
     - Width 800, Quality auto
     - Width 400, Quality auto (thumbnails)
5. Click **Save**

---

## 📝 Step 4: Add to Environment Variables

Add to your `.env` file:

```env
# Backend (server-side, KEEP SECRET)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend (safe to expose - uses unsigned preset)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=ahmad_costimetics
```

---

## 🎯 Step 5: Test Upload

1. Start your dev server: `npm run dev`
2. Use the Chat Widget or Profile section
3. Upload an image
4. ✅ Image uploads to Cloudinary automatically

---

## 📂 Folder Structure

Your uploads will be organized in Cloudinary:

```
ahmad-costimetics/
├── products/      # Product images
├── categories/    # Category icons
├── banners/       # Hero banners
├── profiles/      # User avatars
├── payments/      # Payment proof images
├── chat/          # Chat attachments
└── documents/     # PDFs, files
```

---

## 💻 How to Use in Code

### Basic Upload

```typescript
import { uploadToCloudinary } from './services/cloudinary';

const file = e.target.files[0];
const result = await uploadToCloudinary(file, {
  folder: 'products',
  maxFileSize: 5,
  onProgress: (percent) => console.log(`${percent}%`)
});

console.log(result.secure_url); // Image URL
console.log(result.public_id);  // For deletion later
```

### React Component Usage

```tsx
import ImageUploader from './components/ImageUploader';

<ImageUploader
  folder="profiles"
  multiple={true}
  maxFiles={5}
  maxFileSize={5}
  label="Product Images"
  onChange={(images) => {
    // images = [{ url, publicId, preview, ... }]
    setProductImages(images);
  }}
/>
```

### Optimized Image URLs

```typescript
import { getOptimizedImageUrl, getThumbnailUrl } from './services/cloudinary';

// Auto-optimized (auto quality, format)
const optimized = getOptimizedImageUrl(publicId, {
  width: 800,
  height: 600,
  quality: 'auto',
  format: 'auto', // serves WebP/AVIF when supported
});

// Square thumbnail
const thumb = getThumbnailUrl(publicId, 200);
```

---

## 🛡️ Security Best Practices

### ✅ DO:
- Use **unsigned upload preset** for frontend
- Set **folder** in preset to organize files
- Set **max file size** in preset
- Set **allowed formats** in preset
- Keep `CLOUDINARY_API_SECRET` on backend only
- Validate files before upload (already done in service)

### ❌ DON'T:
- Never expose `CLOUDINARY_API_SECRET` in frontend code
- Don't allow unrestricted file types
- Don't allow large files without limits
- Don't skip authentication for sensitive operations

---

## 🎨 Image Optimization Examples

```typescript
// Product card thumbnail (square, 300x300)
getOptimizedImageUrl(publicId, {
  width: 300,
  height: 300,
  crop: 'fill',
  gravity: 'auto',
  quality: 'auto',
  format: 'auto',
});

// Hero banner (wide, with auto-crop)
getOptimizedImageUrl(publicId, {
  width: 1920,
  height: 600,
  crop: 'fill',
  gravity: 'center',
  quality: 'auto',
});

// Profile picture (small, circular crop)
getOptimizedImageUrl(publicId, {
  width: 150,
  height: 150,
  crop: 'thumb',
  gravity: 'face',
  quality: 'auto',
});

// Blurred placeholder
getOptimizedImageUrl(publicId, {
  width: 50,
  height: 50,
  blur: 1000,
  quality: 50,
});
```

---

## 🚀 Advanced Features

### AI Background Removal
```typescript
const url = `https://res.cloudinary.com/${cloudName}/image/upload/e_background_removal/${publicId}`;
```

### Auto Face Detection & Crop
```typescript
const url = getOptimizedImageUrl(publicId, {
  width: 200,
  height: 200,
  crop: 'thumb',
  gravity: 'face',
});
```

### Watermark
```typescript
const url = `https://res.cloudinary.com/${cloudName}/image/upload/l_watermark/${publicId}`;
```

---

## 💰 Free Tier Limits

| Resource | Free Tier |
|----------|-----------|
| Storage | 25 GB |
| Bandwidth | 25 GB/month |
| Transformations | 25,000/month |
| Admin API calls | 500/hour |

This is more than enough for most ecommerce stores starting out.

---

## 🧪 Testing Checklist

- [ ] Drag & drop functionality works
- [ ] Progress bar shows during upload
- [ ] File size validation (try 10MB+ file)
- [ ] File type validation (try .exe file)
- [ ] Image preview shows immediately
- [ ] Remove image works
- [ ] Mobile upload works
- [ ] Chat image attachment works

---

## 🐛 Troubleshooting

### "Cloudinary cloud name not configured"
- Add `VITE_CLOUDINARY_CLOUD_NAME` to `.env`
- Restart dev server after adding env vars

### "Upload preset not found"
- Verify preset name matches `VITE_CLOUDINARY_UPLOAD_PRESET`
- Check preset is set to **Unsigned** mode in Cloudinary dashboard

### "Upload failed"
- Check browser console for detailed error
- Verify file size and type
- Check network tab for response from Cloudinary

### Images not displaying
- Use `secure_url` (https) instead of `url` (http)
- Check CORS settings in Cloudinary if needed
- Verify image URL is accessible

---

## 📊 Recommended Architecture

```
Frontend (React + Vite)
       │
       │ Upload (unsigned preset)
       ▼
   Cloudinary CDN
       │
       │ Returns secure_url & public_id
       ▼
Save URL to Firebase/MongoDB
       │
       ▼
   Display optimized images
```

---

## 🔗 Useful Links

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Upload Presets](https://cloudinary.com/console/settings/upload)
- [Documentation](https://cloudinary.com/documentation)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)
- [Pricing](https://cloudinary.com/pricing)

---

## 🎉 You're All Set!

Your ecommerce platform now has:
- ✅ Professional image hosting
- ✅ Automatic optimization & CDN
- ✅ Drag & drop uploads
- ✅ Real-time progress tracking
- ✅ Mobile-friendly uploader
- ✅ Organized folder structure
- ✅ Secure architecture

**Total integration time: ~10 minutes** ⚡

Need help? Check the troubleshooting section or contact support.
