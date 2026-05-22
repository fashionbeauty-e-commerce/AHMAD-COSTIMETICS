# 🛍️ Ahmad Costimetics - Enterprise Ecommerce Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](docs/CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-production_ready-green.svg)]()
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)

> **Premium ecommerce platform for fashion, beauty, and lifestyle products** — Built with React, MongoDB, Firebase, and modern best practices.

---

## ✨ Features

### 🛍️ For Customers
- Browse 1000+ products with advanced search & filters
- Real-time chat with customer support
- Multiple payment methods (Stripe, PayPal, Mobile Money)
- Order tracking with live updates
- Wishlist, reviews, and ratings
- Mobile-optimized experience

### 🔐 Security
- Clerk authentication with OAuth
- JWT token-based API
- Role-based access control
- Bcrypt password hashing
- Rate limiting & DDoS protection
- GDPR/CCPA compliant

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/ahmad-costimetics.git
cd ahmad-costimetics

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the app.

---

## 📖 Documentation

Comprehensive documentation is available in the `/docs` folder:

| Document | Description |
|----------|-------------|
| 📐 [Blueprint](docs/BLUEPRINT.md) | Project architecture overview |
| 🏛️ [Architecture](docs/ARCHITECTURE.md) | System architecture details |
| 📡 [API Reference](docs/API.md) | Complete API documentation |
| 🗄️ [Database Schema](docs/DATABASE.md) | Database models & relationships |
| 🛡️ [Security Guide](docs/SECURITY.md) | Security practices & compliance |
| 🚀 [Deployment](DEPLOYMENT.md) | Production deployment guide |
| 🌥️ [Cloudinary Setup](CLOUDINARY_SETUP.md) | Image storage setup |
| ✨ [Features List](FEATURES.md) | All features documented |
| 🤝 [Contributing](docs/CONTRIBUTING.md) | How to contribute |
| 📝 [Changelog](docs/CHANGELOG.md) | Version history |
| 💼 [Code of Conduct](docs/CODE_OF_CONDUCT.md) | Community guidelines |

---

## 🎯 Tech Stack

### Frontend
- **React 19** + **Vite 7** + **TypeScript 5.9**
- **Tailwind CSS 4** for styling
- **React Router 6** for navigation
- **Clerk** for authentication
- **Firebase** for real-time features
- **Socket.IO Client** for live updates

### Backend
- **Node.js 18+** + **Express 4**
- **MongoDB** with **Mongoose 8**
- **JWT** + **Bcrypt** for auth
- **Socket.IO** for real-time
- **Multer** + **Cloudinary** for uploads
- **Stripe** + **PayPal** for payments
- **Helmet** + **Rate Limiter** for security

### Infrastructure
- **Vercel** / Netlify (Frontend)
- **Railway** / Render (Backend)
- **MongoDB Atlas** (Database)
- **Cloudinary** (Image CDN)
- **Firebase** (Real-time)

---

## 📁 Project Structure

```
ahmad-costimetics/
├── public/              # Static assets, favicon
├── src/                 # Frontend source code
│   ├── storefront/      # Customer-facing pages
│   ├── components/      # Shared components
│   ├── services/        # API integrations
│   └── App.tsx          # Main app
├── server/              # Backend Express server
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   └── middleware/      # Express middleware
├── docs/                # Documentation
├── LICENSE              # MIT License
└── README.md            # This file
```

See [BLUEPRINT.md](docs/BLUEPRINT.md) for complete folder structure.

---

## 🌟 Key Highlights

### 🎨 Modern UI/UX
- Luxury fashion aesthetic
- Premium animations
- Mobile-first responsive design
- Dark mode support

### ⚡ Performance
- Lazy loading
- Code splitting
- Image optimization (Cloudinary)
- Database indexing
- CDN delivery

### 🔒 Enterprise Security
- OWASP Top 10 compliant
- PCI DSS compliant (via Stripe)
- GDPR/CCPA/NDPR compliant
- Audit logging
- Rate limiting

### 📱 Full Featured
- 25+ pages
- 50+ API endpoints
- 10+ database models
- Real-time chat
- Multi-payment support

---

## 🎮 Demo

### Live Demo
🌐 **Coming Soon**: https://ahmadcostimetics.com

### Test Credentials


#### Customer Account
```
Use any email to register
Or sign in with Google
```

---

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier OK)
- Clerk account (free tier OK)
- Cloudinary account (free tier OK)

### Available Scripts

```bash
npm run dev          # Start dev server (frontend + backend)
npm run build        # Build for production
npm run start        # Start production server
npm run preview      # Preview production build
```

### Environment Variables

**Critical Variables:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLOUDINARY_*` - Cloudinary credentials

---

## 🚢 Deployment

### Quick Deploy

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Backend (Railway)
1. Push to GitHub
2. Connect repo to Railway
3. Add environment variables
4. Auto-deploy on push

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🧪 Testing

### Manual Testing
- ✅ Customer registration & login
- ✅ Browse & search products
- ✅ Add to cart & checkout
- ✅ Payment flow
- ✅ Real-time chat
- ✅ Mobile responsiveness

### Browser Support
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

---

## 🔐 Security

This project implements comprehensive security measures:

- 🔒 Authentication: Clerk + JWT
- 🛡️ Authorization: Role-based access
- 🔐 Encryption: TLS 1.3 + bcrypt
- 🚫 Rate limiting: Express-rate-limit
- 📋 Audit logs (Server-side)
- ✅ Input validation: All endpoints
- 🛡️ HTTP headers: Helmet.js

See [SECURITY.md](docs/SECURITY.md) for full details.

### Reporting Vulnerabilities
Email: security@ahmadcostimetics.com

**Do NOT** create public GitHub issues for security vulnerabilities.

---

## 🌍 Internationalization

The platform is structured to support:
- 🇺🇸 English (default)
- 🇫🇷 French (planned)
- 🇪🇸 Spanish (planned)
- 🇸🇦 Arabic (planned, RTL)
- 🇳🇬 Hausa (planned)

---

## 📊 Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Lighthouse Score | > 90 | ✅ |
| First Contentful Paint | < 1.5s | ✅ |
| Time to Interactive | < 3.0s | ✅ |
| API Response Time | < 200ms | ✅ |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Quick Contributing Steps
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code of Conduct
Please read our [Code of Conduct](docs/CODE_OF_CONDUCT.md) before contributing.

---

## 📝 Roadmap

### Version 1.1 (Q3 2026)
- [ ] Email notifications
- [ ] Bulk product import
- [ ] Multi-language (i18n)
- [ ] Dark mode

### Version 1.2 (Q4 2026)
- [ ] Mobile apps (React Native)
- [ ] AI product recommendations
- [ ] Loyalty rewards
- [ ] Affiliate program

### Version 2.0 (2025)
- [ ] Multi-vendor marketplace
- [ ] Live shopping
- [ ] AR product viewing
- [ ] Voice shopping

---

## 📜 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

```
Copyright (c) 2026 Ahmad Costimetics
```

The "Ahmad Costimetics" brand is the property of Ahmad Costimetics. Use of brand assets requires permission.

---

## 🙏 Acknowledgments

### Built With Love Using
- [React](https://react.dev) - UI Library
- [Vite](https://vitejs.dev) - Build Tool
- [Tailwind CSS](https://tailwindcss.com) - CSS Framework
- [MongoDB](https://mongodb.com) - Database
- [Express](https://expressjs.com) - Backend Framework
- [Clerk](https://clerk.com) - Authentication
- [Firebase](https://firebase.google.com) - Real-time Database
- [Cloudinary](https://cloudinary.com) - Image CDN
- [Stripe](https://stripe.com) - Payments

### Inspiration
- Amazon's product management
- Shopify's ease of use
- Alibaba's chat system

---

## 📞 Contact & Support

### Business Inquiries
- 🌐 Website: https://ahmadcostimetics.com
- 📧 Email: support@ahmadcostimetics.com
- 📱 Phone: 09011583912, 07052530727
- 📍 Address: Katsina State, Nigeria

### Social Media
- 📘 [Facebook](https://facebook.com/ahmadcostimetics)
- 📷 [Instagram](https://instagram.com/ahmadcostimetics)
- 🎵 [TikTok](https://tiktok.com/@ahmadcostimetics)
- 💬 [WhatsApp](https://wa.me/2349011583912)

### For Developers
- 💻 GitHub Issues: For bugs and features
- 📧 Dev Support: dev@ahmadcostimetics.com
- 🛡️ Security: security@ahmadcostimetics.com

---

## ⭐ Star Us on GitHub!

If you find this project useful, please consider giving it a star. It helps us know our work is appreciated!

---

<div align="center">

**Built with ❤️ by Ahmad Costimetics Team**

*Empowering ecommerce in Africa and beyond*

[Website](https://ahmadcostimetics.com) • [Docs](docs/) • [Contributing](docs/CONTRIBUTING.md) • [License](LICENSE)

</div>
