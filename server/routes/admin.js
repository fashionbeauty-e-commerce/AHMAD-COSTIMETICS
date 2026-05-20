import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import AuditLog from '../models/AuditLog.js';
import Category from '../models/Category.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { auditLog } from '../middleware/logger.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(admin);

// @route   GET /api/admin/dashboard
// @desc    Get complete dashboard data
// @access  Private/Admin
router.get('/dashboard', asyncHandler(async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get all stats in parallel
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    processingOrders,
    lowStockProducts,
    pendingPayments,
    todayOrders,
    todayRevenue,
    weekRevenue,
    monthRevenue
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, isDeleted: false }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),
    Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
    Order.countDocuments({ status: 'processing' }),
    Product.countDocuments({ 
      isActive: true, 
      stock: { $lte: 5 },
      isDeleted: false 
    }),
    Payment.countDocuments({ status: 'payment_pending' }),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: today }, 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: weekAgo }, 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: monthAgo }, 'payment.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        processingOrders,
        lowStockProducts,
        pendingPayments,
        today: {
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0
        },
        week: {
          revenue: weekRevenue[0]?.total || 0
        },
        month: {
          revenue: monthRevenue[0]?.total || 0
        }
      }
    }
  });
}));

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private/Admin
router.get('/analytics', asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Sales data by day
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        'payment.status': 'completed'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Top selling products
  const topProducts = await Product.aggregate([
    { $match: { isDeleted: false } },
    { $sort: { 'metadata.soldCount': -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' }
  ]);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } }
  ]);

  // Customer growth
  const customerGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Payment methods distribution
  const paymentMethods = await Order.aggregate([
    { $match: { 'payment.status': 'completed' } },
    { $group: { _id: '$payment.method', count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } }
  ]);

  res.json({
    success: true,
    data: {
      sales: {
        daily: salesData,
        total: salesData.reduce((sum, d) => sum + d.revenue, 0)
      },
      products: {
        topSelling: topProducts
      },
      orders: {
        byStatus: ordersByStatus
      },
      customers: {
        growth: customerGrowth,
        total: await User.countDocuments({ isActive: true })
      },
      payments: {
        byMethod: paymentMethods
      }
    }
  });
}));

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, isActive } = req.query;
  
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', auditLog('UPDATE_USER'), asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['customer', 'admin', 'super_admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isAdmin: role !== 'customer' },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User role updated',
    data: { user }
  });
}));

// @route   PUT /api/admin/users/:id/activate
// @desc    Activate/deactivate user
// @access  Private/Admin
router.put('/users/:id/activate', auditLog('UPDATE_USER'), asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'}`,
    data: { user }
  });
}));

// @route   GET /api/admin/orders
// @desc    Get all orders with filters
// @access  Private/Admin
router.get('/orders', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus, startDate, endDate } = req.query;

  const query = {};
  if (status) query.status = status;
  if (paymentStatus) query['payment.status'] = paymentStatus;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.find(query)
    .populate('user', 'firstName lastName email phone')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/admin/products/low-stock
// @desc    Get low stock products
// @access  Private/Admin
router.get('/products/low-stock', asyncHandler(async (req, res) => {
  const { threshold = 5 } = req.query;

  const products = await Product.find({
    isActive: true,
    isDeleted: false,
    stock: { $lte: parseInt(threshold) }
  })
    .populate('category', 'name')
    .sort({ stock: 1 })
    .limit(50);

  res.json({
    success: true,
    data: { products }
  });
}));

// @route   GET /api/admin/activity
// @desc    Get audit logs
// @access  Private/Admin
router.get('/activity', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, user } = req.query;

  const query = {};
  if (action) query.action = action;
  if (user) query.user = user;

  const logs = await AuditLog.find(query)
    .populate('user', 'firstName lastName email role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await AuditLog.countDocuments(query);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   POST /api/admin/coupons
// @desc    Create coupon
// @access  Private/Admin
router.post('/coupons', auditLog('CREATE_COUPON'), asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({
    ...req.body,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: { coupon }
  });
}));

// @route   GET /api/admin/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get('/coupons', asyncHandler(async (req, res) => {
  const coupons = await Coupon.find()
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { coupons }
  });
}));

// ===================== Admin Users Management =====================

// @route   GET /api/admin/users?email=<email>
// @desc    Get admin user details
// @access  Private/Admin
router.get('/users', asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (email) {
    // Get specific admin user
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('email firstName lastName role permissions isActive lastLogin');

    if (!user) {
      return res.json({
        success: true,
        data: null
      });
    }

    return res.json({
      success: true,
      data: user
    });
  }

  // Get all admin users
  const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } })
    .select('-password -cart -wishlist')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: admins
  });
}));

// @route   POST /api/admin/users
// @desc    Create a new admin (super_admin only)
// @access  Private/Admin
router.post('/users', auditLog('CREATE_ADMIN'), asyncHandler(async (req, res) => {
  const { email, name, role, permissions, isActive } = req.body;

  // Validate super admin
  if (req.user.role !== 'super_admin') {
    throw new AppError('Only super admins can create admins', 403);
  }

  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail) {
    throw new AppError('Email is required', 400);
  }

  // Check if already exists
  let user = await User.findOne({ email: normalizedEmail });
  
  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    throw new AppError('This email is already an admin', 400);
  }

  if (!user) {
    // Create new user
    user = await User.create({
      email: normalizedEmail,
      firstName: name || 'Admin',
      lastName: '',
      role: role || 'admin',
      permissions: permissions || [],
      isActive: isActive !== false,
      isAdmin: true
    });
  } else {
    // Update existing user to admin
    user = await User.findByIdAndUpdate(
      user._id,
      {
        role: role || 'admin',
        permissions: permissions || [],
        isActive: isActive !== false,
        isAdmin: true
      },
      { new: true }
    );
  }

  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: user
  });
}));

// @route   PUT /api/admin/users/:email
// @desc    Update admin user (super_admin only)
// @access  Private/Admin
router.put('/users/:email', auditLog('UPDATE_ADMIN'), asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { isActive, permissions, role, lastLogin } = req.body;

  // Validate super admin
  if (req.user.role !== 'super_admin') {
    throw new AppError('Only super admins can update admins', 403);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find and update user
  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      ...(isActive !== undefined && { isActive }),
      ...(permissions && { permissions }),
      ...(role && { role }),
      ...(lastLogin && { lastLogin: new Date(lastLogin) })
    },
    { new: true }
  ).select('-password -cart -wishlist');

  if (!user) {
    throw new AppError('Admin user not found', 404);
  }

  res.json({
    success: true,
    message: 'Admin updated successfully',
    data: user
  });
}));

// @route   DELETE /api/admin/users/:email
// @desc    Remove admin status from user (super_admin only)
// @access  Private/Admin
router.delete('/users/:email', auditLog('DELETE_ADMIN'), asyncHandler(async (req, res) => {
  const { email } = req.params;

  // Validate super admin
  if (req.user.role !== 'super_admin') {
    throw new AppError('Only super admins can remove admins', 403);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Update user - remove admin role but keep user record
  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      role: 'customer',
      permissions: [],
      isAdmin: false
    },
    { new: true }
  ).select('-password -cart -wishlist');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Admin status removed successfully',
    data: user
  });
}));

export default router;
