import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token may be invalid.'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Check if account is locked
      if (req.user.isLocked()) {
        return res.status(401).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Admin only middleware
export const admin = authorize('admin', 'super_admin');

// Super admin only middleware
export const superAdmin = authorize('super_admin');

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid, continue without user
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Check if user is admin based on email (for Clerk integration)
export const checkAdminEmail = async (req, res, next) => {
  const SUPER_ADMIN_EMAILS = ['fashionbeauty101f@gmail.com', 'konkcee@gmail.com'];
  const adminEmails = (process.env.ADMIN_EMAILS || 'fashionbeauty101f@gmail.com,konkcee@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase());
  
  if (req.user) {
    const normalizedEmail = req.user.email.toLowerCase().trim();
    const isSuper = SUPER_ADMIN_EMAILS.includes(normalizedEmail);
    const isAdmin = adminEmails.includes(normalizedEmail) || isSuper;

    if (isAdmin) {
      req.user.isAdmin = true;
      const targetRole = isSuper ? 'super_admin' : 'admin';
      
      if (req.user.role !== targetRole) {
        req.user.role = targetRole;
        await req.user.save();
      }
    }
  }
  
  next();
};
