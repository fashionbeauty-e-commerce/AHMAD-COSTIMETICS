# 📡 API Reference Documentation

Complete REST API documentation for Ahmad Costimetics platform.

**Base URL**: `https://api.ahmadcostimetics.com/api` (production)
**Base URL**: `http://localhost:5000/api` (development)

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_token>
```

Tokens are obtained via Clerk authentication or `/api/auth/login`.

---

## 📋 Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (development only)"
}
```

---

## 🔑 Authentication Endpoints

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+234901234567"
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/update-profile
Authorization: Bearer <token>

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+234901234567"
}
```

### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>

{
  "currentPassword": "OldPass",
  "newPassword": "NewPass123"
}
```

---

## 🛍️ Product Endpoints

### Get All Products
```http
GET /api/products?page=1&limit=20&category=Men&minPrice=10&maxPrice=500&sort=-createdAt
```

**Query Parameters**:
- `page` (int, default: 1)
- `limit` (int, default: 20)
- `category` (string)
- `minPrice` (number)
- `maxPrice` (number)
- `rating` (number)
- `brand` (string)
- `search` (string)
- `featured` (boolean)
- `sale` (boolean)
- `sort` (string: `-createdAt`, `price`, `-price`, `rating`, `-rating`)

**Response**:
```json
{
  "success": true,
  "data": {
    "products": [ /* array of products */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### Get Single Product
```http
GET /api/products/:id
```

### Search Products
```http
GET /api/products/search/:query?page=1&limit=20
```

### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>

{
  "name": "Nike Air Jordan 1",
  "brand": "Nike",
  "description": "Premium sneakers...",
  "category": "<category_id>",
  "price": 159.99,
  "compareAtPrice": 189.99,
  "stock": 50,
  "images": [
    { "url": "https://...", "publicId": "xxx" }
  ],
  "tags": ["sneakers", "nike"],
  "specifications": [
    { "name": "Color", "value": "Black/Red" }
  ]
}
```

### Update Product (Admin)
```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
```

### Delete Product (Admin)
```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

### Add Review
```http
POST /api/products/:id/review
Authorization: Bearer <token>

{
  "rating": 5,
  "title": "Great product!",
  "content": "Loved it..."
}
```

---

## 📦 Order Endpoints

### Get Orders
```http
GET /api/orders?page=1&status=pending
Authorization: Bearer <token>
```

**Note**: Customers see only their orders, admins see all.

### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### Create Order
```http
POST /api/orders
Authorization: Bearer <token>

{
  "items": [
    {
      "product": "<product_id>",
      "quantity": 2,
      "size": "M",
      "color": "Black"
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "city": "Katsina",
    "state": "Katsina State",
    "country": "Nigeria",
    "zipCode": "12345",
    "phone": "+234901234567",
    "email": "john@example.com"
  },
  "payment": {
    "method": "stripe"
  },
  "shipping": {
    "method": "standard"
  }
}
```

### Update Order Status (Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>

{
  "status": "shipped",
  "message": "Order shipped via FedEx",
  "trackingNumber": "FX123456789",
  "carrier": "FedEx"
}
```

### Approve Payment (Admin)
```http
PUT /api/orders/:id/approve-payment
Authorization: Bearer <admin_token>

{
  "notes": "Payment verified successfully"
}
```

### Reject Payment (Admin)
```http
PUT /api/orders/:id/reject-payment
Authorization: Bearer <admin_token>

{
  "reason": "Insufficient payment proof"
}
```

### Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer <token>

{
  "reason": "Changed my mind"
}
```

---

## 💳 Payment Endpoints

### Submit Payment
```http
POST /api/payments
Authorization: Bearer <token>
Content-Type: multipart/form-data

orderId: <order_id>
method: mtn_money
amount: 250.00
currency: USD
phoneNumber: +234901234567
provider: MTN
transactionCode: TXN123456
proof: <file>  # Image/PDF for proof
```

### Get My Payments
```http
GET /api/payments/my
Authorization: Bearer <token>
```

### Get All Payments (Admin)
```http
GET /api/payments?status=payment_pending&method=mtn_money
Authorization: Bearer <admin_token>
```

### Approve Payment (Admin)
```http
PUT /api/payments/:id/approve
Authorization: Bearer <admin_token>

{
  "notes": "Verified successfully"
}
```

### Reject Payment (Admin)
```http
PUT /api/payments/:id/reject
Authorization: Bearer <admin_token>

{
  "reason": "Invalid transaction code"
}
```

### Stripe Payment Intent
```http
POST /api/payments/create-intent
Authorization: Bearer <token>

{
  "orderId": "<order_id>"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "publishableKey": "pk_xxx"
  }
}
```

---

## 🗂️ Category Endpoints

### Get All Categories
```http
GET /api/categories?active=true&parent=null
```

### Get Category Tree
```http
GET /api/categories/tree
```

### Get Single Category with Products
```http
GET /api/categories/:id?page=1&limit=20
```

### Create Category (Admin)
```http
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

name: Men's Shoes
description: All men's footwear
parent: <parent_id_or_empty>
order: 1
isFeatured: true
image: <file>
```

### Update Category (Admin)
```http
PUT /api/categories/:id
Authorization: Bearer <admin_token>
```

### Delete Category (Admin)
```http
DELETE /api/categories/:id
Authorization: Bearer <admin_token>
```

---

## 💬 Chat / Messages Endpoints

### Get Chat Rooms
```http
GET /api/messages/rooms
Authorization: Bearer <token>
```

### Create Chat Room
```http
POST /api/messages/rooms
Authorization: Bearer <token>

{
  "participantId": "<user_id>"
}
```

### Get Messages
```http
GET /api/messages/rooms/:roomId?page=1&limit=50
Authorization: Bearer <token>
```

### Send Message
```http
POST /api/messages
Authorization: Bearer <token>

{
  "roomId": "<room_id>",
  "content": "Hello, I have a question",
  "type": "text"
}
```

### Mark as Read
```http
PUT /api/messages/:id/read
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /api/messages/unread-count
Authorization: Bearer <token>
```

---

## 🔔 Notification Endpoints

### Get Notifications
```http
GET /api/notifications?page=1&unread=true
Authorization: Bearer <token>
```

### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

---

## ⭐ Review Endpoints

### Get Reviews
```http
GET /api/reviews?product=<product_id>&page=1
```

### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>

{
  "product": "<product_id>",
  "rating": 5,
  "title": "Excellent",
  "content": "Best purchase ever"
}
```

### Update Review
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
```

### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

### Approve Review (Admin)
```http
PUT /api/reviews/:id/approve
Authorization: Bearer <admin_token>
```

### Mark Helpful
```http
PUT /api/reviews/:id/helpful
Authorization: Bearer <token>
```

---

## 📤 Upload Endpoints

### Delete File (Cloudinary)
```http
POST /api/upload/delete
Authorization: Bearer <admin_token>

{
  "publicId": "ahmad-costimetics/products/xxx"
}
```

### Sign Upload (for signed uploads)
```http
POST /api/upload/sign
Authorization: Bearer <admin_token>

{
  "folder": "products",
  "publicId": "optional_public_id"
}
```

### Get Image Info
```http
GET /api/upload/info/:publicId
```

---

## ⚡ Real-time Events (Socket.IO)

### Client → Server Events

```javascript
socket.emit('join_user', userId);
socket.emit('join_admin');
socket.emit('send_message', { recipientId, content });
socket.emit('typing', { recipientId });
socket.emit('stop_typing', { recipientId });
```

### Server → Client Events

```javascript
socket.on('new_order', (orderData) => {});
socket.on('order_status_changed', (data) => {});
socket.on('payment_approved', (data) => {});
socket.on('payment_rejected', (data) => {});
socket.on('receive_message', (message) => {});
socket.on('user_typing', (data) => {});
socket.on('receive_notification', (notification) => {});
```

---

## 🚦 Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Auth endpoints | 5 requests per minute |
| Public APIs | 100 requests per 15 minutes |
| Admin APIs | 200 requests per 15 minutes |
| Upload endpoints | 20 requests per hour |

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## 🚨 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful, no response body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable - Validation failed |
| 429 | Too Many Requests - Rate limit hit |
| 500 | Server Error - Internal error |

---

## 🧪 Testing the API

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get products with token
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
Import the Postman collection from `docs/postman_collection.json`

---

## 📝 Webhook Endpoints

### Stripe Webhook
```http
POST /api/payments/webhook
Stripe-Signature: <signature>

# Handles events:
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.refunded
```

---

## 🔍 Health Check

```http
GET /api/health
```

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2026-06-15T10:30:00Z",
  "uptime": 86400
}
```

---

**Last Updated**: June 2026
**API Version**: 1.0.0
