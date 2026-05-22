# 🛡️ Security Documentation

Comprehensive security documentation for Ahmad Costimetics platform.

---

## 🎯 Security Philosophy

We follow **Defense in Depth** - multiple layers of security so that if one layer fails, others continue to protect the system.

---

## 🔐 Authentication & Authorization

### Authentication Methods

#### 1. Clerk Authentication (Primary)
- OAuth 2.0 / OpenID Connect
- Google Sign-In
- Email/password with magic links
- Multi-factor authentication (MFA) support
- Session management
- Automatic token refresh

#### 2. JWT Token-Based (Backend API)
```javascript
{
  "algorithm": "HS256",
  "secret": "stored in env (256-bit)",
  "expiresIn": "30 days",
  "refreshExpiresIn": "90 days"
}
```

#### 3. Bcrypt Password Hashing
```javascript
{
  "algorithm": "bcrypt",
  "saltRounds": 10,
  "minPasswordLength": 8,
  "requirements": [
    "min 8 characters",
    "stored as hash",
    "never returned in API"
  ]
}
```

### Authorization Levels

```
┌────────────────────────────────────┐
│  PUBLIC                             │
│  No authentication needed           │
│  • Browse products                  │
│  • View categories                  │
│  • Read reviews                     │
└────────────────────────────────────┘
              │
┌────────────────────────────────────┐
│  CUSTOMER (Authenticated)           │
│  Logged-in user                     │
│  • Place orders                     │
│  • Manage cart/wishlist             │
│  • Write reviews                    │
│  • Chat with support                │
└────────────────────────────────────┘
              │
┌────────────────────────────────────┐
│  ADMIN (API Access Only)            │
│  Whitelisted email + admin role     │
│  • Manage products (via API)        │
│  • Manage categories (via API)      │
│  • Approve payments (via API)       │
│  • Manage customers (via API)       │
└────────────────────────────────────┘
              │
┌────────────────────────────────────┐
│  SUPER ADMIN (API Access Only)      │
│  Hardcoded emails only              │
│  • Manage other admins (via API)    │
│  • System settings (via API)        │
└────────────────────────────────────┘
```

> **Note**: The Admin Dashboard UI has been moved to a separate repository for enhanced security. This repository only contains the Customer Storefront.

### Admin Email Whitelist
Admin access is controlled via backend environment variables and hardcoded super admin emails in the authentication middleware.

---

## 🛡️ Input Validation & Sanitization

### Frontend Validation
```javascript
// Email
/^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password
- Min 8 characters
- Mix of letters and numbers (recommended)

// Phone
- Numeric only
- Country code support
```

### Backend Validation
- Validator.js for emails, URLs, etc.
- Mongoose schema validation
- Custom validators for business logic
- Sanitize against NoSQL injection
- Strip HTML/scripts from inputs

### Example Validation
```javascript
// Server-side
import validator from 'validator';

if (!validator.isEmail(email)) {
  throw new AppError('Invalid email', 400);
}

if (!validator.isStrongPassword(password, {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 0,
  minNumbers: 1,
  minSymbols: 0
})) {
  throw new AppError('Password too weak', 400);
}
```

---

## 🚨 Attack Prevention

### 1. SQL/NoSQL Injection
**Threat**: Malicious queries via user input

**Protection**:
- ✅ Mongoose ORM (parameterized queries)
- ✅ Input sanitization
- ✅ No string concatenation in queries
- ✅ Whitelist allowed operators

```javascript
// ❌ VULNERABLE
db.users.find({ email: req.body.email });

// ✅ SAFE
db.users.find({ email: validator.normalizeEmail(req.body.email) });
```

### 2. Cross-Site Scripting (XSS)
**Threat**: Malicious scripts in user input

**Protection**:
- ✅ React auto-escapes content
- ✅ DOMPurify for rich text
- ✅ Content Security Policy (CSP)
- ✅ HttpOnly cookies
- ✅ X-XSS-Protection header

```javascript
// CSP Header
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' clerk.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: cloudinary.com;
```

### 3. Cross-Site Request Forgery (CSRF)
**Threat**: Unauthorized actions on behalf of users

**Protection**:
- ✅ SameSite cookies
- ✅ CSRF tokens (Clerk handles)
- ✅ Verify Origin/Referer headers
- ✅ Custom request headers

### 4. DDoS / Brute Force
**Threat**: Overwhelming server with requests

**Protection**:
- ✅ Rate limiting (Express-rate-limit)
- ✅ Account lockout after failed logins
- ✅ Cloudflare DDoS protection
- ✅ Request size limits

```javascript
// Rate Limiting Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: 'Too many requests'
});

// Account Lockout
- After 5 failed attempts: lock for 2 hours
- Automatic reset on successful login
```

### 5. Session Hijacking
**Threat**: Stealing user sessions

**Protection**:
- ✅ Secure cookies (HttpOnly, Secure, SameSite)
- ✅ Token rotation
- ✅ Short session timeouts
- ✅ IP validation for sensitive actions

### 6. File Upload Attacks
**Threat**: Malicious files (viruses, exploits)

**Protection**:
- ✅ File type whitelist (jpg, png, pdf only)
- ✅ File size limits (5-10MB)
- ✅ Cloudinary validation
- ✅ No execution of uploaded files
- ✅ Separate storage from web root

```javascript
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    if (!allowed.test(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});
```

---

## 🔒 HTTP Security Headers

### Helmet.js Configuration
```javascript
app.use(helmet({
  contentSecurityPolicy: false, // Custom CSP
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### Security Headers
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=()
```

---

## 🌐 CORS Configuration

```javascript
app.use(cors({
  origin: [
    'https://ahmadcostimetics.com',
    'https://www.ahmadcostimetics.com',
    'http://localhost:5173' // dev only
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));
```

---

## 💾 Data Protection

### Encryption

#### At Rest
- MongoDB Atlas: Encrypted storage
- Backups: Encrypted
- Sensitive fields: Additional encryption

#### In Transit
- HTTPS/TLS 1.3 only
- HSTS enforced
- Perfect Forward Secrecy

### Sensitive Data Handling
```javascript
// User passwords
- Stored: bcrypt hash
- Never returned in API responses
- excluded from queries by default

// Payment info
- Stored: Tokens only (Stripe/PayPal IDs)
- Never store full card numbers
- PCI DSS compliant via Stripe

// Personal data
- Email: Required, encrypted
- Phone: Optional, encrypted
- Address: Encrypted
```

### Data Retention
| Data Type | Retention Period |
|-----------|-----------------|
| User Account | Until deletion request |
| Order History | 7 years (legal requirement) |
| Payment Records | 7 years (legal requirement) |
| Chat Messages | 1 year |
| Audit Logs | 1 year |
| Session Data | 30 days |
| Logs | 90 days |

---

## 🔑 API Security

### Authentication Flow
```
1. Client sends credentials
2. Server validates → issues JWT
3. Client stores JWT (localStorage/cookie)
4. Each request includes JWT in Authorization header
5. Server verifies JWT → grants access
```

### API Key Management
```bash
# Backend secrets (NEVER expose)
JWT_SECRET=...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_API_SECRET=...
MONGODB_URI=mongodb+srv://...

# Frontend (safe to expose)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_FIREBASE_API_KEY=...
VITE_CLOUDINARY_CLOUD_NAME=...
```

### Environment Variables
- ✅ Stored in `.env` (gitignored)
- ✅ Never committed to repository
- ✅ Different values per environment
- ✅ Encrypted in deployment platforms
- ✅ Rotated regularly

---

## 📋 Audit Logging

Critical administrative actions performed via the API are logged server-side for audit purposes.

### Logged Actions
- User logins/logouts
- Failed login attempts
- Critical resource changes (CRUD via Admin API)
- Payment approvals/rejections

---

## 🚦 Rate Limiting

### Endpoints Protection

```javascript
// Strict (auth endpoints)
- /api/auth/login: 5 per 15 min
- /api/auth/register: 3 per 15 min
- /api/auth/forgot-password: 3 per hour

// Moderate (data endpoints)
- /api/products: 100 per 15 min
- /api/orders: 50 per 15 min

// Lenient (read-only)
- /api/categories: 200 per 15 min

// Upload endpoints
- /api/upload/*: 20 per hour
```

### IP-Based Blocking
- Automatic block after suspicious activity
- Manual block list for known bad actors
- Whitelist for trusted IPs

---

## 🔐 Secret Management

### Production Best Practices
1. Use environment variable services (Vercel, Railway secrets)
2. Never commit secrets to Git
3. Rotate secrets every 90 days
4. Use different secrets per environment
5. Audit secret access

### Secret Rotation Schedule
| Secret | Rotation |
|--------|----------|
| JWT_SECRET | Every 6 months |
| API Keys | Every 12 months |
| Database password | Every 12 months |
| Webhook secrets | When needed |

---

## 🎯 OWASP Top 10 Compliance

| OWASP Risk | Status | Mitigation |
|------------|--------|------------|
| A01: Broken Access Control | ✅ | RBAC, email whitelist, ownership checks |
| A02: Cryptographic Failures | ✅ | TLS 1.3, bcrypt, encrypted storage |
| A03: Injection | ✅ | Mongoose ORM, input validation |
| A04: Insecure Design | ✅ | Defense in depth, security reviews |
| A05: Security Misconfiguration | ✅ | Helmet.js, CORS, secure defaults |
| A06: Vulnerable Components | ✅ | Regular npm audit, updates |
| A07: Auth Failures | ✅ | Clerk, MFA, account lockout |
| A08: Data Integrity | ✅ | Signed JWT, HTTPS only |
| A09: Logging Failures | ✅ | Audit logs, monitoring |
| A10: SSRF | ✅ | URL validation, allow lists |

---

## 🚨 Incident Response

### Security Incident Workflow

```
1. DETECT
   - Monitoring alerts
   - User reports
   - Audit log analysis

2. ASSESS
   - Severity level
   - Affected systems
   - Data exposure

3. CONTAIN
   - Block attacker
   - Disable affected accounts
   - Revoke tokens

4. ERADICATE
   - Remove malicious code
   - Patch vulnerabilities
   - Update dependencies

5. RECOVER
   - Restore from backups
   - Re-enable services
   - Notify users

6. POST-MORTEM
   - Document incident
   - Update procedures
   - Train team
```

### Severity Levels

| Level | Response Time | Examples |
|-------|---------------|----------|
| Critical | < 1 hour | Data breach, payment fraud |
| High | < 4 hours | Account takeover, DDoS |
| Medium | < 24 hours | XSS, CSRF |
| Low | < 1 week | Minor info disclosure |

---

## 📋 Security Checklist

### Development
- [ ] Use environment variables for secrets
- [ ] Validate all user inputs
- [ ] Use parameterized queries
- [ ] Implement proper authentication
- [ ] Add authorization checks
- [ ] Sanitize outputs
- [ ] Use HTTPS in development

### Pre-Deployment
- [ ] Run npm audit
- [ ] Review dependencies for vulnerabilities
- [ ] Test authentication flows
- [ ] Verify CORS configuration
- [ ] Check security headers
- [ ] Review error messages (no info leak)
- [ ] Update all dependencies

### Production
- [ ] Enable HTTPS (force redirect)
- [ ] Configure WAF (Web Application Firewall)
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Enable rate limiting
- [ ] Configure backup strategy
- [ ] Set up logging
- [ ] Document incident response

### Ongoing
- [ ] Regular security audits (quarterly)
- [ ] Penetration testing (annually)
- [ ] Dependency updates (monthly)
- [ ] Secret rotation (per schedule)
- [ ] Security training for team
- [ ] Compliance reviews

---

## 🔔 Vulnerability Reporting

### Report Security Issues
**DO NOT** open public GitHub issues for security vulnerabilities.

**Email**: security@ahmadcostimetics.com

**Include**:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

### Response Time
- Acknowledgment: 24 hours
- Initial assessment: 72 hours
- Fix timeline: Based on severity

### Bug Bounty Program
We currently do not offer monetary rewards but will:
- Credit you publicly (with permission)
- Send swag/merchandise
- Add to Hall of Fame

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Mozilla Web Security](https://infosec.mozilla.org/guidelines/web_security)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [React Security](https://snyk.io/blog/10-react-security-best-practices/)

---

## 🤝 Compliance

### GDPR (Europe)
- ✅ User consent for data collection
- ✅ Right to access data
- ✅ Right to delete data
- ✅ Data portability
- ✅ Privacy by design

### CCPA (California)
- ✅ Disclosure of data collected
- ✅ Right to opt-out
- ✅ Right to delete
- ✅ Non-discrimination

### PCI DSS
- ✅ No card data stored
- ✅ Stripe handles all payments
- ✅ HTTPS for all transactions
- ✅ Audit logging

### NDPR (Nigeria)
- ✅ Local data protection compliance
- ✅ User consent
- ✅ Data subject rights

---

**Last Updated**: June 2026
**Version**: 1.0.0

For security questions: security@ahmadcostimetics.com
