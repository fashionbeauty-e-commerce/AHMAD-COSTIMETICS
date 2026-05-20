import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(protect);
router.use(admin);

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/dashboard', asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Revenue
  const revenueData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        'payment.status': 'completed'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$pricing.total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Top products
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

  // Customer growth
  const customerGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
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

  // Summary stats
  const totalRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        'payment.status': 'completed'
      }
    },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } }
  ]);

  const thisWeekRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        'payment.status': 'completed'
      }
    },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } }
  ]);

  res.json({
    success: true,
    data: {
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisWeek: thisWeekRevenue[0]?.total || 0,
        daily: revenueData
      },
      orders: {
        byStatus: ordersByStatus,
        total: ordersByStatus.reduce((sum, o) => sum + o.count, 0)
      },
      products: {
        topSelling: topProducts
      },
      customers: {
        growth: customerGrowth,
        total: await User.countDocuments({ isActive: true })
      }
    }
  });
}));

export default router;
