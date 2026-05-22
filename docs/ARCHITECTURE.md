# 🏛️ System Architecture

Detailed technical architecture of the Ahmad Costimetics platform.

---

## 🎯 Architecture Principles

1. **Separation of Concerns** - Clear boundaries between layers
2. **Scalability First** - Designed to handle growth
3. **Security by Default** - Multiple layers of protection
4. **Performance Optimized** - Fast loading, efficient queries
5. **Mobile-First** - Responsive across all devices
6. **Developer-Friendly** - Clean code, well-documented

---

## 🌐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                              │
│  ┌────────────────────────┐    ┌──────────────────────────┐   │
│  │  React App (Vite)      │    │  Service Workers         │   │
│  │  - Components          │    │  - Caching               │   │
│  │  - Routing             │    │  - Offline Support       │   │
│  │  - State Management    │    │  - Push Notifications    │   │
│  └────────────────────────┘    └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EDGE / CDN LAYER                            │
│  • CloudFlare / Vercel Edge                                     │
│  • SSL Termination                                              │
│  • DDoS Protection                                              │
│  • Static Asset Caching                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │  Express API Server  │◄────►│  Socket.IO Server    │        │
│  │  - REST Endpoints    │      │  - Live Chat         │        │
│  │  - Middleware Stack  │      │  - Notifications     │        │
│  │  - Auth Validation   │      │  - Order Updates     │        │
│  └──────────────────────┘      └──────────────────────┘        │
│           │                              │                       │
│           └──────────┬───────────────────┘                       │
│                      ▼                                           │
│  ┌─────────────────────────────────────────────────┐           │
│  │  Service Layer                                   │           │
│  │  - Auth Service                                  │           │
│  │  - Payment Service                               │           │
│  │  - Order Service                                 │           │
│  │  - Email Service                                 │           │
│  │  - Upload Service                                │           │
│  └─────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │  MongoDB     │  │  Firebase    │  │  Redis Cache     │     │
│  │  (Primary)   │  │  (Realtime)  │  │  (Optional)      │     │
│  │              │  │              │  │                  │     │
│  │  • Users     │  │  • Chat      │  │  • Sessions     │     │
│  │  • Products  │  │  • Live Data │  │  • Hot Data     │     │
│  │  • Orders    │  │  • Admins    │  │  • Rate Limits  │     │
│  │  • Payments  │  │  • Notif.    │  │                  │     │
│  └──────────────┘  └──────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Cloudinary │ │  Stripe    │ │  PayPal    │ │  Clerk     │  │
│  │  (Images)  │ │ (Payments) │ │ (Payments) │ │   (Auth)   │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Nodemailer │ │  Sanity    │ │   Sentry   │ │  Google    │  │
│  │  (Email)   │ │   (CMS)    │ │ (Monitor)  │ │ Analytics  │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────┐           │
│  │  External Admin Dashboard (Built Separately)      │           │
│  └───────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Architecture

### Frontend Component Hierarchy

```
App
├── ClerkProvider
│   ├── BrowserRouter
│   │   ├── StorefrontLayout
│   │   │   ├── TopBar
│   │   │   ├── Header (with Search)
│   │   │   ├── Navbar
│   │   │   ├── <Outlet> (Pages)
│   │   │   ├── Footer
│   │   │   ├── ChatWidget
│   │   │   └── CookieConsent
```

### Component Communication
```
┌────────────────────────────────────┐
│  Parent Component                   │
│  - Manages State                    │
│  - Handles Logic                    │
└────────────────────────────────────┘
       │                    ▲
   props│                   │ events
       ▼                    │
┌────────────────────────────────────┐
│  Child Component                    │
│  - Displays UI                      │
│  - Emits Events                     │
└────────────────────────────────────┘
```

---

## 🔐 Authentication Architecture

### Multi-Layer Authentication

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Clerk (Identity Provider)              │
│  • Email/Password                                │
│  • Google OAuth                                  │
│  • Magic Links                                   │
│  • MFA Support                                   │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Layer 2: JWT Token Issuance                     │
│  • Access Token (short-lived)                   │
│  • Refresh Token (long-lived)                   │
│  • Stored in localStorage/cookies                │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Layer 3: Backend Verification                   │
│  • Verify JWT signature                         │
│  • Check token expiration                        │
│  • Validate user exists                          │
│  • Check account status                          │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Layer 4: Authorization                          │
│  • Role check (customer)                         │
│  • Permission check                              │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Layer 5: Resource Access                        │
│  • Owner check (user owns resource)             │
│  • Scope check (read/write/delete)              │
└─────────────────────────────────────────────────┘
```

---

## 💳 Payment Architecture

### Payment Flow Diagram

```
Customer                  Frontend              Backend              External
    │                        │                     │                     │
    │ 1. Place Order         │                     │                     │
    │───────────────────────►│                     │                     │
    │                        │ 2. Create Order     │                     │
    │                        │────────────────────►│                     │
    │                        │                     │ 3. Save to DB       │
    │                        │                     │────────►MongoDB     │
    │                        │ 4. Order Created    │                     │
    │                        │◄────────────────────│                     │
    │ 5. Choose Payment      │                     │                     │
    │───────────────────────►│                     │                     │
    │                        │                     │                     │
    │                        │  ┌─ Stripe Path ─┐  │                     │
    │                        │  │              │   │                     │
    │                        │  ▼              │   │                     │
    │                        │ 6a. Create     │   │                     │
    │                        │   Payment      │   │                     │
    │                        │   Intent       │   │                     │
    │                        │ ──────────────►│   │ 7a. Stripe API     │
    │                        │                │   │ ──────────────►Stripe│
    │                        │                │   │ Client Secret       │
    │                        │ ◄──────────────│   │ ◄───────────────────│
    │ 8a. Pay with Card     │                │   │                     │
    │ ─────────────────────►│ Stripe.js      │   │                     │
    │                        │ Confirm Payment│   │                     │
    │                        │ ──────────────►│ ──┼──Stripe Webhook────►│
    │                        │                │   │ Update Order        │
    │                        │                │   │ ──────►MongoDB     │
    │                        │                │   │                     │
    │                        │  ┌─ Mobile Money Path ─┐                 │
    │                        │  │                    │                  │
    │                        │  ▼                    │                  │
    │ 6b. Show Pay Number   │                       │                  │
    │ ◄─────────────────────│                       │                  │
    │ 7b. Pay & Get Code    │                       │                  │
    │                        │                       │                  │
    │ 8b. Upload Proof      │                       │                  │
    │ ─────────────────────►│ Upload to            │                  │
    │                        │ Cloudinary ─────────►│ Cloudinary CDN  │
    │                        │ ◄────────────────────│ Image URL        │
    │                        │ 9b. Submit Payment   │                  │
    │                        │ ────────────────────►│ Save Payment     │
    │                        │                       │ ──────►MongoDB  │
    │                        │                       │ Notify Admin     │
    │                        │                       │ ─────►Socket.IO │
    │                        │                       │                  │
    │                        │  ┌─ Admin Approves ─┐│                  │
    │                        │  ▼ (Separate App)   ││                  │
    │                        │  Admin Reviews ────►││                  │
    │                        │  Approves Payment   ││                  │
    │                        │  ──────────────────►││ Update Order    │
    │                        │                      ││ Status: Paid    │
    │ 10. Order Confirmed   │                      ││ ─────►Email     │
    │ ◄─────────────────────│ ◄───────────────────│└──Notification──►│
    │                        │                      │                  │
```

---

## 🗄️ Database Architecture

### MongoDB Schema Relationships

```
┌──────────────┐       ┌──────────────┐
│    User      │1     N│    Order     │
│              │◄──────│              │
│ - email      │       │ - items[]    │
│ - role       │       │ - payment    │
│ - addresses  │       │ - status     │
└──────────────┘       └──────────────┘
       │                      │
       │N                     │N
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│    Review    │       │   Payment    │
│              │       │              │
│ - rating     │       │ - method     │
│ - content    │       │ - amount     │
│              │       │ - proof      │
└──────────────┘       └──────────────┘
       │                      
       │N                     
       │                      
       ▼                      
┌──────────────┐       ┌──────────────┐
│   Product    │N     1│   Category   │
│              │──────►│              │
│ - name       │       │ - name       │
│ - price      │       │ - slug       │
│ - stock      │       │ - parent     │
│ - images     │       │              │
└──────────────┘       └──────────────┘
                              │
                              │1
                              ▼
                       ┌──────────────┐
                       │ SubCategory  │
                       │              │
                       └──────────────┘
```

### Indexing Strategy

```javascript
// User Collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });

// Product Collection  
db.products.createIndex({ name: 'text', description: 'text', tags: 'text' });
db.products.createIndex({ category: 1, isActive: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });

// Order Collection
db.orders.createIndex({ user: 1, createdAt: -1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ status: 1 });

// Payment Collection
db.payments.createIndex({ order: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ reference: 1 }, { unique: true });
```

---

## ⚡ Real-time Architecture

### Socket.IO Event Flow

```
Customer Browser              Server                Admin Dashboard
      │                          │                  (Separate App)
      │ Connect                  │                        │
      ├─────────────────────────►│                        │
      │ join_user(userId)        │                        │
      ├─────────────────────────►│                        │
      │                          │                        │
      │                          │              Connect    │
      │                          │◄────────────────────────┤
      │                          │              join_admin │
      │                          │◄────────────────────────┤
      │                          │                        │
      │ Place Order              │                        │
      ├─────────────────────────►│                        │
      │                          │ Emit: new_order        │
      │                          │ to admin_room          │
      │                          ├───────────────────────►│
      │                          │                        │
      │                          │ Admin Updates Status   │
      │                          │◄───────────────────────┤
      │                          │ Emit: order_status     │
      │                          │ _changed               │
      │ Receive Update           │ to user_<id>           │
      │◄─────────────────────────┤                        │
      │                          │                        │
```

---

## 🔄 State Management Architecture

### Frontend State Layers

```
┌─────────────────────────────────────┐
│  Global State                        │
│  - User Auth (useAuth hook)         │
│  - Theme/Preferences                │
│  - Cart (localStorage + Context)    │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Page State                          │
│  - useState for local state         │
│  - useEffect for data fetching      │
│  - URL params for shareable state   │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Component State                     │
│  - Form inputs                       │
│  - UI toggles                        │
│  - Loading states                    │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  External State                      │
│  - Firebase real-time subscriptions │
│  - Socket.IO event listeners        │
│  - localStorage/sessionStorage      │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────┐
│           DOMAIN: ahmadcostimetics.com           │
└─────────────────────────────────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
         (frontend)           (api)
              │                 │
              ▼                 ▼
┌────────────────┐      ┌────────────┐
│    Vercel      │      │  Railway/  │
│   (Frontend)   │      │   Render   │
│                │      │  (Backend) │
└────────────────┘      └────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              MongoDB Atlas Cluster               │
│  • Multi-region replication                     │
│  • Automatic backups                            │
│  • 99.99% SLA                                   │
└─────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
Developer Push to Git
         │
         ▼
┌────────────────────┐
│  GitHub Actions    │
│  - Run tests       │
│  - Lint code       │
│  - Build project   │
└────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Vercel │ │Railway │
│ Deploy │ │ Deploy │
└────────┘ └────────┘
    │         │
    └────┬────┘
         ▼
   Production Live
```

---

## 📊 Performance Architecture

### Caching Strategy

```
┌─────────────────────────────────────┐
│  Browser Cache                       │
│  • Static assets (images, CSS, JS)  │
│  • API responses (with ETag)        │
└─────────────────────────────────────┘
              │ Miss
              ▼
┌─────────────────────────────────────┐
│  CDN Cache (Cloudflare/Vercel)      │
│  • Static assets                    │
│  • HTML pages                       │
└─────────────────────────────────────┘
              │ Miss
              ▼
┌─────────────────────────────────────┐
│  Application Cache (Redis)           │
│  • API responses                     │
│  • Database query results            │
│  • Session data                      │
└─────────────────────────────────────┘
              │ Miss
              ▼
┌─────────────────────────────────────┐
│  Database (MongoDB)                  │
│  • Indexed queries                   │
│  • Aggregation pipelines             │
└─────────────────────────────────────┘
```

### Optimization Techniques

1. **Frontend Optimizations**
   - Code splitting (lazy loading routes)
   - Image lazy loading
   - Virtual scrolling for long lists
   - Memoization (useMemo, useCallback)
   - Bundle size optimization

2. **Backend Optimizations**
   - Database indexing
   - Query optimization (lean queries)
   - Connection pooling
   - Compression (gzip)
   - Rate limiting

3. **Network Optimizations**
   - HTTP/2
   - CDN delivery
   - Image format optimization (WebP)
   - Asset compression
   - Caching headers

---

## 🛡️ Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────┐
│  Layer 1: Network                    │
│  • HTTPS/TLS 1.3                    │
│  • Firewall rules                    │
│  • DDoS protection                   │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│  Layer 2: Application                │
│  • CORS policy                       │
│  • Helmet.js headers                 │
│  • Rate limiting                     │
│  • Input validation                  │
│  • SQL/NoSQL injection prevention   │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│  Layer 3: Authentication             │
│  • JWT verification                  │
│  • OAuth 2.0                         │
│  • Bcrypt password hashing           │
│  • Token expiration                  │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│  Layer 4: Authorization              │
│  • Role-based access                 │
│  • Permission checks                 │
│  • Resource ownership                │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│  Layer 5: Data                       │
│  • Encryption at rest                │
│  • Encryption in transit             │
│  • Audit logging                     │
│  • Backup encryption                 │
└─────────────────────────────────────┘
```

---

## 📈 Scalability Architecture

### Horizontal Scaling

```
                Load Balancer
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   API Server 1 API Server 2 API Server 3
        │            │            │
        └────────────┼────────────┘
                     ▼
              MongoDB Replica Set
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    Primary       Secondary    Secondary
```

### Microservices Migration Path

```
Current (Monolith)         Future (Microservices)
   ┌──────────┐               ┌──────────┐
   │          │               │  Auth    │
   │   API    │       →       └──────────┘
   │  Server  │               ┌──────────┐
   │          │               │ Products │
   └──────────┘               └──────────┘
                              ┌──────────┐
                              │  Orders  │
                              └──────────┘
                              ┌──────────┐
                              │ Payments │
                              └──────────┘
```

---

## 🔧 Technology Decisions

### Why React 19?
- Latest features (Server Components ready)
- Excellent ecosystem
- Strong community
- Easy to find developers

### Why Vite over Next.js?
- Faster dev server
- Simpler configuration
- Better for SPA
- Smaller bundle

### Why MongoDB?
- Flexible schema for products
- Great with JSON-like data
- Easy horizontal scaling
- Good free tier

### Why Tailwind CSS 4?
- Utility-first approach
- Smaller bundle
- Easy customization
- Great DX

### Why Clerk for Auth?
- Handles complex auth flows
- OAuth providers built-in
- Beautiful UI components
- Good developer experience

### Why Cloudinary for Images?
- Best image optimization
- Auto format conversion
- Built-in transformations
- Generous free tier

---

**Last Updated**: June 2026
**Version**: 1.0.0
