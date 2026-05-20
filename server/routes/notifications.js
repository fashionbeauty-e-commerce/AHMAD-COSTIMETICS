import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { auditLog } from '../middleware/logger.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread } = req.query;
  
  const query = { user: req.user._id, isDeleted: false };
  if (unread === 'true') query.isRead = false;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Notification.countDocuments(query);

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', protect, asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
    isDeleted: false
  });

  res.json({
    success: true,
    data: { count }
  });
}));

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    data: { notification }
  });
}));

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification deleted'
  });
}));

// ===================== Admin Notification Creation =====================

// @route   POST /api/notifications
// @desc    Create and send notification (admin only)
// @access  Private/Admin
router.post('/', protect, admin, auditLog('CREATE_NOTIFICATION'), asyncHandler(async (req, res) => {
  const {
    userId,
    userIds,
    notifyAllUsers,
    type,
    title,
    message,
    description,
    icon,
    data,
    priority = 'medium',
    notifyVia = {}
  } = req.body;

  // Validate required fields
  if (!type || !title || !message) {
    throw new AppError('Type, title, and message are required', 400);
  }

  if (!userId && !userIds?.length && !notifyAllUsers) {
    throw new AppError('Either userId, userIds array, or notifyAllUsers flag is required', 400);
  }

  // Determine target user IDs
  let targetUserIds = [];

  if (notifyAllUsers) {
    const allUsers = await User.find({ isActive: true }).select('_id');
    targetUserIds = allUsers.map(u => u._id);
  } else if (userIds?.length) {
    targetUserIds = userIds;
  } else if (userId) {
    targetUserIds = [userId];
  }

  // Create notifications for each user
  const notifications = await Promise.all(
    targetUserIds.map(uid =>
      Notification.create({
        user: uid,
        type,
        title,
        message,
        description,
        icon: icon || 'bell',
        data: data || {},
        priority,
        sentVia: {
          email: notifyVia.email || false,
          push: notifyVia.push || false,
          sms: notifyVia.sms || false
        }
      })
    )
  );

  res.status(201).json({
    success: true,
    message: `Notification sent to ${notifications.length} user(s)`,
    data: { notifications }
  });
}));

// @route   GET /api/notifications/type/:type
// @desc    Get notifications by type
// @access  Private
router.get('/type/:type', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const notifications = await Notification.find({
    user: req.user._id,
    type: req.params.type,
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();

  const total = await Notification.countDocuments({
    user: req.user._id,
    type: req.params.type,
    isDeleted: false
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

export default router;
