# 🗄️ Database Documentation

Complete database schema documentation for Ahmad Costimetics platform.

---

## 📊 Database Overview

The platform uses two databases:

1. **MongoDB Atlas** (Primary) - Persistent data storage
2. **Firebase Firestore** (Secondary) - Real-time features

---

## 🍃 MongoDB Schemas

### 👤 User Schema
**Collection**: `users`

```javascript
{
  _id: ObjectId,
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt, min 8 chars),
  firstName: String (required),
  lastName: String (required),
  phone: String,
  avatar: String (URL),
  role: String (enum: ['customer', 'admin', 'super_admin'], default: 'customer'),
  isAdmin: Boolean (default: false),
  
  addresses: [{
    type: String (enum: ['home', 'work', 'other']),
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String,
    isDefault: Boolean
  }],
  
  wishlist: [ObjectId (ref: Product)],
  
  cart: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    size: String,
    color: String
  }],
  
  orders: [ObjectId (ref: Order)],
  reviews: [ObjectId (ref: Review)],
  notifications: [ObjectId (ref: Notification)],
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerified: Boolean (default: false),
  lastLogin: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  isActive: Boolean (default: true),
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ email: 1 } unique
{ role: 1 }
{ createdAt: -1 }

// Methods
- comparePassword(candidatePassword)
- generateAuthToken()
- generateResetPasswordToken()
- isLocked()
- incLoginAttempts()
- resetLoginAttempts()
- getPublicProfile()
```

### 🛍️ Product Schema
**Collection**: `products`

```javascript
{
  _id: ObjectId,
  name: String (required, max 200 chars),
  slug: String (unique, lowercase),
  description: String (required, max 2000 chars),
  shortDescription: String (max 500 chars),
  
  category: ObjectId (ref: Category, required),
  brand: String,
  sku: String (unique, uppercase),
  
  price: Number (required, min 0),
  compareAtPrice: Number,
  cost: Number,
  
  stock: Number (required, default 0),
  lowStockThreshold: Number (default 5),
  
  images: [{
    url: String,
    publicId: String (Cloudinary),
    alt: String,
    isPrimary: Boolean
  }],
  thumbnail: String,
  
  variants: [{
    name: String,    // e.g., "Size", "Color"
    options: [String] // e.g., ["S", "M", "L"]
  }],
  
  attributes: [{
    name: String,
    value: String
  }],
  
  tags: [String],
  
  rating: Number (0-5, default 0),
  numReviews: Number (default 0),
  reviews: [ObjectId (ref: Review)],
  
  isFeatured: Boolean (default false),
  isNew: Boolean (default false),
  isOnSale: Boolean (default false),
  saleStartDate: Date,
  saleEndDate: Date,
  
  isActive: Boolean (default true),
  isDeleted: Boolean (default false),
  
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  
  metadata: {
    views: Number (default 0),
    soldCount: Number (default 0),
    wishlistCount: Number (default 0)
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Virtuals
- discountPercentage
- availabilityStatus

// Indexes
{ name: 'text', description: 'text', tags: 'text' } // Text search
{ category: 1, isActive: 1 }
{ price: 1 }
{ rating: -1 }
{ slug: 1 } unique
{ sku: 1 } unique
```

### 📦 Order Schema
**Collection**: `orders`

```javascript
{
  _id: ObjectId,
  orderNumber: String (auto-generated, unique),
  user: ObjectId (ref: User, required),
  
  items: [{
    product: ObjectId (ref: Product, required),
    name: String,
    image: String,
    quantity: Number (min 1),
    price: Number,
    size: String,
    color: String,
    subtotal: Number
  }],
  
  shippingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String,
    email: String
  },
  
  billingAddress: { /* same as shipping */ },
  
  payment: {
    method: String (enum: ['card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'mobile_money']),
    transactionId: String,
    status: String (enum: ['pending', 'processing', 'completed', 'failed', 'refunded']),
    paidAt: Date,
    cardLast4: String,
    cardBrand: String
  },
  
  pricing: {
    subtotal: Number,
    shipping: Number,
    tax: Number,
    discount: Number,
    total: Number
  },
  
  shipping: {
    method: String (enum: ['standard', 'express', 'overnight']),
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
  
  status: String (enum: [
    'pending',
    'confirmed', 
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refunded'
  ]),
  
  statusHistory: [{
    status: String,
    message: String,
    timestamp: Date,
    notified: Boolean
  }],
  
  notes: {
    customer: String,
    admin: String
  },
  
  coupon: {
    code: String,
    discount: Number,
    type: String
  },
  
  refund: {
    status: String,
    reason: String,
    amount: Number,
    processedAt: Date
  },
  
  cancellation: {
    reason: String,
    cancelledBy: ObjectId,
    cancelledAt: Date
  },
  
  ip: String,
  userAgent: String,
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ user: 1, createdAt: -1 }
{ orderNumber: 1 } unique
{ status: 1 }
{ 'payment.status': 1 }
```

### 💳 Payment Schema
**Collection**: `payments`

```javascript
{
  _id: ObjectId,
  order: ObjectId (ref: Order, required),
  user: ObjectId (ref: User, required),
  
  method: String (enum: ['stripe', 'paypal', 'airtel_money', 'mtn_money', 'bank_transfer', 'cash_on_delivery']),
  amount: Number (required, min 0),
  currency: String (default 'USD'),
  
  status: String (enum: [
    'pending',
    'payment_pending',
    'payment_approved',
    'payment_rejected',
    'processing',
    'completed',
    'failed',
    'refunded'
  ]),
  
  transactionId: String (unique, sparse),
  reference: String (unique, auto-generated: PAY-XXXXXX),
  
  proofImage: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  
  mobileMoneyDetails: {
    phoneNumber: String,
    provider: String,
    transactionCode: String
  },
  
  bankTransferDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    depositDate: Date
  },
  
  stripeDetails: {
    paymentIntentId: String,
    chargeId: String,
    cardLast4: String,
    cardBrand: String
  },
  
  paypalDetails: {
    paymentId: String,
    payerId: String,
    payerEmail: String
  },
  
  verifiedBy: ObjectId (ref: User),
  verifiedAt: Date,
  verificationNotes: String,
  rejectionReason: String,
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ order: 1 }
{ user: 1, createdAt: -1 }
{ status: 1 }
{ reference: 1 } unique
```

### 🗂️ Category Schema
**Collection**: `categories`

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  slug: String (unique, auto-generated),
  description: String (max 1000 chars),
  
  parent: ObjectId (ref: Category, default null),
  children: [ObjectId (ref: Category)],
  
  image: {
    url: String,
    publicId: String,
    alt: String
  },
  
  banner: {
    url: String,
    publicId: String
  },
  
  icon: String,
  level: Number (default 0),
  order: Number (default 0),
  
  isActive: Boolean (default true),
  isFeatured: Boolean (default false),
  productCount: Number (default 0),
  
  metadata: {
    title: String,
    description: String,
    keywords: [String]
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ slug: 1 } unique
{ parent: 1 }
{ level: 1, order: 1 }

// Static Methods
- getCategoryTree(parentId)
```

### ⭐ Review Schema
**Collection**: `reviews`

```javascript
{
  _id: ObjectId,
  product: ObjectId (ref: Product, required),
  user: ObjectId (ref: User, required),
  order: ObjectId (ref: Order),
  
  rating: Number (required, 1-5),
  title: String (max 100 chars),
  content: String (required, max 1000 chars),
  
  images: [{
    url: String,
    publicId: String
  }],
  
  pros: [String],
  cons: [String],
  
  isVerifiedPurchase: Boolean (default false),
  isApproved: Boolean (default false),
  isFeatured: Boolean (default false),
  
  helpful: [ObjectId (ref: User)],
  unhelpful: [ObjectId (ref: User)],
  
  adminResponse: {
    content: String,
    respondedBy: ObjectId,
    respondedAt: Date
  },
  
  status: String (enum: ['pending', 'approved', 'rejected']),
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ product: 1, createdAt: -1 }
{ user: 1 }
{ rating: 1 }
{ isApproved: 1, isFeatured: -1 }
{ product: 1, user: 1 } unique // Prevent duplicates
```

### 💬 Message Schema
**Collection**: `messages`

```javascript
{
  _id: ObjectId,
  room: ObjectId (ref: ChatRoom, required),
  sender: ObjectId (ref: User, required),
  recipient: ObjectId (ref: User, required),
  
  content: String (required, max 2000 chars),
  type: String (enum: ['text', 'image', 'file', 'product', 'system']),
  
  attachments: [{
    type: String,
    url: String,
    name: String,
    size: Number,
    mimeType: String
  }],
  
  product: ObjectId (ref: Product),  // For sharing products
  order: ObjectId (ref: Order),       // For order-related chats
  
  isRead: Boolean (default false),
  readAt: Date,
  
  isDeleted: Boolean (default false),
  deletedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ room: 1, createdAt: -1 }
{ sender: 1, recipient: 1 }
{ isRead: 1 }
```

### 🏠 ChatRoom Schema
**Collection**: `chatrooms`

```javascript
{
  _id: ObjectId,
  participants: [ObjectId (ref: User, required)],
  
  type: String (enum: ['direct', 'support', 'group']),
  
  lastMessage: ObjectId (ref: Message),
  lastMessageAt: Date,
  
  unreadCount: Map<userId, count>,
  
  isActive: Boolean (default true),
  
  metadata: {
    subject: String,
    tags: [String]
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ participants: 1 }
{ lastMessageAt: -1 }
```

### 🔔 Notification Schema
**Collection**: `notifications`

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required, indexed),
  
  type: String (enum: [
    'order', 'payment', 'shipping', 'promotion',
    'review', 'message', 'system', 'security',
    'product', 'wishlist'
  ]),
  
  title: String (required),
  message: String (required),
  description: String,
  icon: String,
  
  data: {
    orderId: ObjectId,
    productId: ObjectId,
    messageId: ObjectId,
    url: String,
    action: String,
    metadata: Mixed
  },
  
  isRead: Boolean (default false),
  readAt: Date,
  isDeleted: Boolean (default false),
  
  priority: String (enum: ['low', 'medium', 'high', 'urgent']),
  expiresAt: Date,
  
  sentVia: {
    email: Boolean,
    push: Boolean,
    sms: Boolean
  },
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ user: 1, createdAt: -1 }
{ user: 1, isRead: 1 }
{ type: 1, priority: 1 }
```

### 🎫 Coupon Schema
**Collection**: `coupons`

```javascript
{
  _id: ObjectId,
  code: String (required, unique, uppercase),
  description: String (max 500 chars),
  
  discountType: String (enum: ['percentage', 'fixed'], required),
  discountValue: Number (required, min 0),
  
  minOrderAmount: Number (default 0),
  maxDiscountAmount: Number,
  
  usageLimit: Number (default null),
  usageLimitPerUser: Number (default 1),
  usedCount: Number (default 0),
  
  usedBy: [{
    user: ObjectId (ref: User),
    usedAt: Date,
    orderId: ObjectId (ref: Order)
  }],
  
  applicableProducts: [ObjectId (ref: Product)],
  applicableCategories: [ObjectId (ref: Category)],
  excludedProducts: [ObjectId (ref: Product)],
  
  startDate: Date (required),
  endDate: Date (required),
  
  isActive: Boolean (default true),
  isPublic: Boolean (default true),
  
  createdBy: ObjectId (ref: User),
  
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ code: 1 } unique
{ isActive: 1, startDate: 1, endDate: 1 }

// Methods
- isValid()
- canUserUse(userId)
- calculateDiscount(orderTotal)
- markAsUsed(userId, orderId)
```

### 📋 AuditLog Schema
**Collection**: `auditlogs`

```javascript
{
  _id: ObjectId,
  
  action: String (required, enum: [
    'LOGIN', 'LOGOUT',
    'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
    'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
    'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
    'CREATE_ORDER', 'UPDATE_ORDER', 'DELETE_ORDER',
    'APPROVE_PAYMENT', 'REJECT_PAYMENT',
    'CREATE_COUPON', 'UPDATE_COUPON', 'DELETE_COUPON',
    'SEND_NOTIFICATION', 'EXPORT_DATA',
    'CHANGE_SETTINGS', 'VIEW_REPORT', 'OTHER'
  ]),
  
  entity: String (required),       // e.g., 'Product', 'Order'
  entityId: ObjectId,
  
  user: ObjectId (ref: User, required),
  userEmail: String (required),
  userName: String (required),
  role: String (required),
  
  changes: {
    before: Mixed,
    after: Mixed
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String,
    location: String
  },
  
  status: String (enum: ['success', 'failed', 'pending']),
  errorMessage: String,
  
  severity: String (enum: ['low', 'medium', 'high', 'critical']),
  
  createdAt: Date
}

// Indexes
{ user: 1, createdAt: -1 }
{ action: 1, createdAt: -1 }
{ entity: 1, entityId: 1 }
{ severity: 1, createdAt: -1 }

// Optional TTL index (auto-delete after 1 year)
// { createdAt: 1 } expireAfterSeconds: 31536000
```

---

## 🔥 Firebase Firestore Collections

### Admins Collection
**Path**: `/admins/{email}`

```javascript
{
  email: string,
  name: string,
  role: 'admin' | 'manager',
  permissions: string[],
  isActive: boolean,
  addedBy: string,
  addedAt: Timestamp,
  updatedAt: Timestamp,
  lastLogin: Timestamp
}
```

### ChatRooms Collection
**Path**: `/chatRooms/{roomId}`

```javascript
{
  participants: string[],
  type: 'direct' | 'support',
  lastMessage: string,
  lastMessageAt: Timestamp,
  createdAt: Timestamp
}
```

### Messages Collection
**Path**: `/messages/{messageId}`

```javascript
{
  roomId: string,
  senderId: string,
  text: string,
  read: boolean,
  createdAt: Timestamp
}
```

### Categories Collection (Real-time)
**Path**: `/categories/{categoryId}`

```javascript
{
  name: string,
  slug: string,
  description: string,
  image: { url: string, publicId: string },
  parent: string | null,
  productCount: number,
  isActive: boolean,
  isFeatured: boolean,
  order: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Products Collection (Real-time)
**Path**: `/products/{productId}`

```javascript
{
  name: string,
  brand: string,
  sku: string,
  category: string,
  price: number,
  compareAtPrice: number,
  stock: number,
  description: string,
  images: { url: string, publicId: string }[],
  thumbnail: string,
  emoji: string,
  rating: number,
  numReviews: number,
  isActive: boolean,
  isFeatured: boolean,
  isNew: boolean,
  features: string[],
  specifications: { name: string, value: string }[],
  tags: string[],
  createdAt: Timestamp,
  createdBy: string
}
```

---

## 🔗 Database Relationships

```
User (1) ──────── (N) Order
User (1) ──────── (N) Review
User (1) ──────── (N) Notification
User (N) ──────── (N) Product (via Wishlist)

Order (1) ─────── (N) Payment
Order (1) ─────── (N) OrderItem (embedded)

Product (N) ────── (1) Category
Product (1) ────── (N) Review
Product (1) ────── (N) Image (embedded)

Category (N) ───── (1) Category (parent)
Category (1) ───── (N) Product

ChatRoom (1) ──── (N) Message
ChatRoom (N) ──── (N) User (participants)

Coupon (N) ────── (N) User (usage tracking)
Coupon (N) ────── (N) Product (applicable)
```

---

## 🔄 Data Flow Examples

### Creating an Order
```
1. User adds items to cart (User.cart array)
2. User checks out → Creates Order document
3. Order references User ID
4. Items array contains Product references + snapshots
5. Payment document created, references Order
6. Stock decremented in Product documents
7. Notification created for User
8. AuditLog entry created
```

### Real-time Chat
```
1. User opens chat → Subscribe to ChatRoom in Firestore
2. Send message → Add to /messages collection
3. Update ChatRoom.lastMessage in Firestore
4. Other participant receives via real-time listener
5. Mark as read → Update message.read field
```

---

## 📈 Performance Considerations

### Query Optimization
- All foreign keys are indexed
- Text search on product name/description
- Compound indexes for common query patterns
- Lean queries when full document not needed

### Pagination
- Default limit: 20 items
- Skip-based pagination for small datasets
- Cursor-based pagination for large datasets

### Aggregations
```javascript
// Top selling products
db.products.aggregate([
  { $match: { isActive: true } },
  { $sort: { 'metadata.soldCount': -1 } },
  { $limit: 10 }
]);

// Sales by category
db.orders.aggregate([
  { $unwind: '$items' },
  { $lookup: {
      from: 'products',
      localField: 'items.product',
      foreignField: '_id',
      as: 'productInfo'
  }},
  { $group: {
      _id: '$productInfo.category',
      totalSales: { $sum: '$items.subtotal' }
  }}
]);
```

---

## 🛡️ Security Considerations

### Sensitive Data
- Passwords: Bcrypt hashed (never plain text)
- Payment info: Tokens only (no card numbers stored)
- Personal data: Encrypted at rest

### Access Control
- Field-level security (e.g., `password` excluded from queries)
- Role-based collection access
- User can only access own data

### Data Validation
- Mongoose schema validation
- Custom validators for emails, phones
- Sanitization of user inputs

---

## 💾 Backup Strategy

### MongoDB Atlas
- Automatic daily backups (free tier: 2 days retention)
- Point-in-time recovery (paid tier)
- Cross-region replication

### Firebase
- Automatic backups
- Export to Google Cloud Storage
- Restore from snapshots

---

## 📊 Monitoring

### Key Metrics to Monitor
- Query performance (slow queries log)
- Connection pool usage
- Index usage statistics
- Disk space usage
- Memory usage
- Read/write operations per second

---

**Last Updated**: June 2026
**Version**: 1.0.0
