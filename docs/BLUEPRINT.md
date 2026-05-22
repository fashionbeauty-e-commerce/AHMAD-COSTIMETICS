# 📐 Ahmad Costimetics - Project Blueprint

**Complete architectural blueprint and technical specification**

---

## 🎯 Project Overview

| Attribute | Value |
|-----------|-------|
| **Project Name** | Ahmad Costimetics Ecommerce Platform |
| **Version** | 1.0.0 |
| **License** | MIT (with branding restrictions) |
| **Type** | Full-Stack Enterprise Ecommerce |
| **Status** | Production Ready |
| **Started** | 2026 |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      AHMAD COSTIMETICS                           │
│                  Ecommerce Platform Architecture                 │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                          │
├──────────────────────────────────────────────────────────────┤
│  Customer Storefront                                          │
│  - HomePage                                                  │
│  - ProductsPage                                              │
│  - ProductDetailPage                                         │
│  - SearchPage                                                │
│  - CartPage                                                  │
│  - CheckoutPage                                              │
│  - AccountPage                                               │
│  - WishlistPage                                              │
│  - Legal Pages                                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                        │
├──────────────────────────────────────────────────────────────┤
│  Clerk (Primary)            │      Backend Verification       │
│  - Email/Password           │      - JWT Tokens              │
│  - Google OAuth             │      - Admin Email Whitelist   │
│  - Session Management       │      - Role-Based Access       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                           │
├──────────────────────────────────────────────────────────────┤
│  Frontend Services          │      Backend APIs               │
│  - cloudinary.ts           │      - /api/auth                │
│  - firebase.ts             │      - /api/products            │
│  - api.js                  │      - /api/orders              │
│                            │      - /api/payments            │
│                            │      - /api/categories          │
│                            │      - /api/messages            │
│                            │      - /api/upload              │
│                            │      - /api/notifications       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                  │
├──────────────────────────────────────────────────────────────┤
│  MongoDB Atlas              │      Firebase Firestore         │
│  - Users                    │      - Real-time Chat          │
│  - Products                 │      - Live Notifications      │
│  - Orders                   │      - Admin Database          │
│  - Payments                 │      - Categories Backup       │
│  - Reviews                  │                                │
│  - Categories               │                                │
│  - Coupons                  │                                │
│  - AuditLogs                │                                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                           │
├──────────────────────────────────────────────────────────────┤
│  Cloudinary    Stripe       PayPal       Mobile Money         │
│  (Storage)     (Payment)    (Payment)    (Payment)            │
│                                                                │
│  Firebase      Socket.IO    Nodemailer   Sanity CMS           │
│  (Realtime)    (Live)       (Email)      (Content)            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Technology Stack

### Frontend
```json
{
  "framework": "React 19",
  "build_tool": "Vite 7",
  "language": "TypeScript 5.9",
  "styling": "Tailwind CSS 4",
  "routing": "React Router 6",
  "state": "React Hooks + Context",
  "auth": "@clerk/clerk-react 5",
  "icons": "Lucide React",
  "animations": "Framer Motion 11",
  "realtime_client": "Firebase 10 + Socket.IO Client"
}
```

### Backend
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express 4",
  "database": "MongoDB 8 (Mongoose)",
  "auth": "JWT + Bcrypt",
  "realtime": "Socket.IO 4",
  "validation": "Validator.js",
  "security": "Helmet + Rate Limiter",
  "uploads": "Multer + Cloudinary",
  "payments": "Stripe SDK",
  "email": "Nodemailer"
}
```

### Infrastructure
```json
{
  "hosting_frontend": "Vercel / Netlify",
  "hosting_backend": "Railway / Render",
  "database": "MongoDB Atlas",
  "cdn_images": "Cloudinary",
  "realtime_db": "Firebase Firestore",
  "auth_provider": "Clerk",
  "cms": "Sanity.io",
  "monitoring": "Sentry (optional)",
  "analytics": "Google Analytics (optional)"
}
```

---

## 📁 Complete Folder Structure

```
ahmad-ecommerce/
│
├── 📂 public/                          # Static assets
│   ├── favicon.png
│   └── images/
│       ├── hero-banner.jpg
│       ├── new-arrivals.jpg
│       ├── trending-shoes.jpg
│       ├── mens-collection.jpg
│       └── beauty-essentials.jpg
│
├── 📂 src/                             # Frontend source
│   │
│   ├── 📂 storefront/                  # Customer-facing app
│   │   ├── StorefrontLayout.tsx
│   │   ├── 📂 components/
│   │   │   ├── Header.tsx              # Logo + Search + Auth
│   │   │   ├── TopBar.tsx              # Promo banner
│   │   │   ├── Navbar.tsx              # Category nav
│   │   │   ├── Footer.tsx              # Links + Contact
│   │   │   ├── HeroBanner.tsx          # Homepage hero
│   │   │   ├── Categories.tsx          # Category icons
│   │   │   ├── FeaturedProducts.tsx    # Product grid
│   │   │   ├── PromoBanners.tsx        # Promo cards
│   │   │   ├── Newsletter.tsx          # Email signup
│   │   │   ├── TrustBadges.tsx         # Trust indicators
│   │   │   ├── ChatWidget.tsx          # Live chat
│   │   │   └── CookieConsent.tsx       # GDPR banner
│   │   │
│   │   └── 📂 pages/
│   │       ├── HomePage.tsx
│   │       ├── ProductsPage.tsx
│   │       ├── ProductDetailPage.tsx
│   │       ├── SearchPage.tsx          # Smart search
│   │       ├── CartPage.tsx
│   │       ├── CheckoutPage.tsx
│   │       ├── WishlistPage.tsx
│   │       ├── AccountPage.tsx
│   │       ├── AboutPage.tsx
│   │       ├── ContactPage.tsx
│   │       ├── FAQPage.tsx
│   │       ├── SignInPage.tsx          # Clerk
│   │       ├── SignUpPage.tsx          # Clerk
│   │       ├── PrivacyPolicyPage.tsx
│   │       ├── TermsPage.tsx
│   │       └── CookiePolicyPage.tsx
│   │
│   ├── 📂 components/                  # Shared components
│   │   └── ImageUploader.tsx           # Cloudinary uploader
│   │
│   ├── 📂 services/                    # API integrations
│   │   ├── firebase.ts                 # Firebase + Firestore
│   │   ├── cloudinary.ts               # Image uploads
│   │   ├── api.js                      # Backend API client
│   │   └── api.d.ts                    # TypeScript defs
│   │
│   ├── 📂 utils/
│   │   └── cn.ts                       # className utility
│   │
│   ├── App.tsx                         # Main router + auth
│   ├── main.tsx                        # Entry point
│   ├── config.ts                       # Configuration
│   ├── index.css                       # Global styles
│   └── vite-env.d.ts                   # Type declarations
│
├── 📂 server/                          # Backend Express
│   ├── index.js                        # Server entry
│   │
│   ├── 📂 models/                      # MongoDB schemas
│   │   ├── User.js                     # User accounts
│   │   ├── Product.js                  # Products
│   │   ├── Order.js                    # Orders
│   │   ├── Payment.js                  # Payments
│   │   ├── Category.js                 # Categories
│   │   ├── Review.js                   # Reviews
│   │   ├── Message.js                  # Chat messages
│   │   ├── Notification.js             # User notifications
│   │   ├── Coupon.js                   # Discount coupons
│   │   └── AuditLog.js                 # Admin actions
│   │
│   ├── 📂 routes/                      # API endpoints
│   │   ├── auth.js                     # /api/auth
│   │   ├── users.js                    # /api/users
│   │   ├── products.js                 # /api/products
│   │   ├── orders.js                   # /api/orders
│   │   ├── payments.js                 # /api/payments
│   │   ├── categories.js               # /api/categories
│   │   ├── reviews.js                  # /api/reviews
│   │   ├── messages.js                 # /api/messages
│   │   ├── notifications.js            # /api/notifications
│   │   └── upload.js                   # /api/upload
│   │
│   └── 📂 middleware/
│       ├── auth.js                     # JWT auth
│       ├── clerkAuth.js                # Clerk verification
│       ├── errorHandler.js             # Error handling
│       └── logger.js                   # Request logging
│
├── 📂 docs/                            # Documentation
│   ├── BLUEPRINT.md                    # This file
│   ├── ARCHITECTURE.md                 # System architecture
│   ├── API.md                          # API reference
│   ├── DATABASE.md                     # Schema docs
│   ├── DEPLOYMENT.md                   # Deploy guide
│   ├── SECURITY.md                     # Security practices
│   ├── CONTRIBUTING.md                 # Contribution guide
│   └── CHANGELOG.md                    # Version history
│
├── 📄 LICENSE                          # MIT License
├── 📄 README.md                        # Project readme
├── 📄 ADMIN_ACCESS.md                  # Admin guide
├── 📄 CLOUDINARY_SETUP.md              # Image setup
├── 📄 FEATURES.md                      # Feature list
├── 📄 .env.example                     # Env template
├── 📄 .env                             # Env variables (gitignore)
├── 📄 .gitignore                       # Git ignore
├── 📄 package.json                     # Dependencies
├── 📄 tsconfig.json                    # TypeScript config
├── 📄 vite.config.ts                   # Vite config
└── 📄 index.html                       # HTML entry
```

---

## 🔐 Security Architecture

### Authentication Flow
```
User → Clerk (OAuth/Email) → Token Issued → Stored Client-Side
  ↓
Frontend uses token for API calls
  ↓
Backend verifies token (JWT/Clerk SDK)
  ↓
Admin email whitelist check
  ↓
Role-based access granted
```

### Security Layers
1. **Network**: HTTPS, CORS, Helmet.js headers
2. **Application**: Rate limiting, Input validation, XSS protection
3. **Authentication**: JWT, OAuth 2.0, Refresh tokens
4. **Authorization**: Role-based, Email whitelist, Permission system
5. **Data**: Bcrypt hashing, Encrypted env vars, MongoDB injection prevention
6. **Audit**: Activity logs, Admin action tracking, IP logging

---

## 📊 Database Architecture

### MongoDB Collections (10 models)

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User accounts | email, password, role, addresses |
| `products` | Product catalog | name, brand, price, stock, images |
| `orders` | Customer orders | user, items, status, payment |
| `payments` | Payment records | order, method, proof, status |
| `categories` | Product categories | name, slug, parent, image |
| `reviews` | Product reviews | product, user, rating, content |
| `messages` | Chat messages | room, sender, content, type |
| `notifications` | User notifications | user, type, message, read |
| `coupons` | Discount coupons | code, type, value, usage |
| `auditlogs` | Admin actions | action, user, entity, changes |

### Firebase Firestore Collections

| Collection | Purpose |
|------------|---------|
| `admins` | Dynamic admin management |
| `chatRooms` | Real-time chat rooms |
| `messages` | Live chat messages |
| `categories` | Real-time category sync |
| `products` | Real-time product sync |

---

## 🎯 Feature Matrix

### Customer Features (✅ Working)

| Feature | Status | Description |
|---------|--------|-------------|
| Browse Products | ✅ | Grid view with filters |
| Product Search | ✅ | Smart search across all fields |
| Product Details | ✅ | Full product info, variants |
| Add to Cart | ✅ | Persistent cart |
| Wishlist | ✅ | Save favorites |
| Multi-Step Checkout | ✅ | Shipping → Payment → Review |
| Multiple Payment Methods | ✅ | Stripe, PayPal, Mobile Money, Bank |
| Payment Proof Upload | ✅ | Cloudinary integration |
| Order Tracking | ✅ | Real-time status updates |
| Live Chat Support | ✅ | Real-time with admin |
| Account Dashboard | ✅ | Profile, Orders, Addresses |
| Reviews & Ratings | ✅ | Product reviews |
| Notifications | ✅ | In-app notifications |
| Mobile Responsive | ✅ | All devices |

### Legal Pages (✅ Working)

| Page | Status | Features |
|------|--------|----------|
| Privacy Policy | ✅ | GDPR/CCPA compliant, 12 sections |
| Terms of Service | ✅ | 16 detailed sections |
| Cookie Policy | ✅ | Interactive preferences manager |
| Cookie Consent Banner | ✅ | First-visit popup |

---

## 🔌 API Architecture

### REST API Endpoints (50+)

#### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
GET    /api/auth/me
PUT    /api/auth/update-profile
PUT    /api/auth/change-password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
```

#### Products
```
GET    /api/products
GET    /api/products/:id
GET    /api/products/search/:query
POST   /api/products              [admin]
PUT    /api/products/:id          [admin]
DELETE /api/products/:id          [admin]
POST   /api/products/:id/review
```

#### Orders
```
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id/status     [admin]
PUT    /api/orders/:id/cancel
PUT    /api/orders/:id/approve-payment  [admin]
PUT    /api/orders/:id/reject-payment   [admin]
GET    /api/orders/my/orders
GET    /api/orders/stats          [admin]
```

#### Payments
```
POST   /api/payments
GET    /api/payments              [admin]
GET    /api/payments/my
GET    /api/payments/:id
PUT    /api/payments/:id/approve  [admin]
PUT    /api/payments/:id/reject   [admin]
POST   /api/payments/verify
POST   /api/payments/create-intent (Stripe)
POST   /api/payments/webhook (Stripe)
POST   /api/payments/paypal
POST   /api/payments/mobile-money
```

#### Categories
```
GET    /api/categories
GET    /api/categories/tree
GET    /api/categories/:id
POST   /api/categories            [admin]
PUT    /api/categories/:id        [admin]
DELETE /api/categories/:id        [admin]
POST   /api/categories/:id/banner [admin]
```

#### Messages (Chat)
```
GET    /api/messages/rooms
POST   /api/messages/rooms
GET    /api/messages/rooms/:roomId
POST   /api/messages
PUT    /api/messages/:id/read
DELETE /api/messages/:id
GET    /api/messages/unread-count
```

#### Upload
```
POST   /api/upload/delete         [admin]
POST   /api/upload/sign           [admin]
GET    /api/upload/info/:publicId
POST   /api/upload/transform
```

---

## 🚀 Deployment Architecture

### Production Setup
```
┌─────────────────────────────────────────┐
│  Users                                   │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  CDN / Cloudflare                        │
│  - SSL Termination                       │
│  - DDoS Protection                       │
│  - Caching                               │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Vercel (Frontend)                       │
│  - React App                             │
│  - Edge Functions                        │
│  - Auto-deploy from Git                  │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Railway / Render (Backend)              │
│  - Express API                           │
│  - Socket.IO Server                      │
│  - Auto-scale                            │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  External Services                       │
│  - MongoDB Atlas                         │
│  - Cloudinary                            │
│  - Firebase                              │
│  - Stripe                                │
│  - Clerk                                 │
└─────────────────────────────────────────┘
```

---

## 📈 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| First Contentful Paint | < 1.5s | ✅ |
| Time to Interactive | < 3.0s | ✅ |
| Lighthouse Score | > 90 | ✅ |
| API Response Time | < 200ms | ✅ |
| Mobile Performance | > 85 | ✅ |
| SEO Score | > 90 | ✅ |
| Accessibility | > 90 | ✅ |

---

## 🌍 Internationalization Ready

The platform is structured to support:
- Multiple languages (i18n ready)
- Multiple currencies
- Regional payment methods
- Localized content
- RTL languages

---

## 📞 Support & Contact

- **Technical Support**: support@ahmadcostimetics.com
- **Sales Inquiries**: sales@ahmadcostimetics.com
- **Emergency**: 09011583912
- **Address**: Katsina State, Nigeria

---

**Built with ❤️ for Ahmad Costimetics**
*Enterprise Ecommerce Platform - Version 1.0.0*
