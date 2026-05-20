import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { auditLog } from '../middleware/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/payments/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
  }
});

// @route   POST /api/payments
// @desc    Create payment with proof upload
// @access  Private
router.post('/', protect, upload.single('proof'), asyncHandler(async (req, res) => {
  const { 
    orderId, 
    method, 
    amount, 
    currency = 'USD',
    transactionId,
    phoneNumber,
    provider,
    transactionCode,
    bankName,
    accountNumber,
    accountName,
    depositDate
  } = req.body;

  // Validate order
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized for this order', 403);
  }

  // Create payment record
  const paymentData = {
    order: orderId,
    user: req.user._id,
    method,
    amount,
    currency,
    transactionId,
    metadata: {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      platform: 'web'
    }
  };

  // Add method-specific details
  if (['airtel_money', 'mtn_money'].includes(method)) {
    paymentData.mobileMoneyDetails = {
      phoneNumber,
      provider,
      transactionCode
    };
  }

  if (method === 'bank_transfer') {
    paymentData.bankTransferDetails = {
      bankName,
      accountNumber,
      accountName,
      depositDate: depositDate ? new Date(depositDate) : new Date()
    };
  }

  // Add proof image if uploaded
  if (req.file) {
    paymentData.proofImage = {
      url: `/uploads/payments/${req.file.filename}`,
      publicId: req.file.filename,
      uploadedAt: new Date()
    };
  }

  const payment = await Payment.create(paymentData);

  // Update order payment status
  order.payment.status = 'payment_pending';
  order.payment.transactionId = payment.reference;
  await order.save();

  // Emit socket event for realtime notification
  const io = req.app.get('io');
  if (io) {
    io.to('admin_room').emit('new_payment', {
      paymentId: payment._id,
      orderNumber: order.orderNumber,
      amount: payment.amount,
      method: payment.method,
      customer: req.user.firstName + ' ' + req.user.lastName,
      hasProof: !!req.file
    });
  }

  res.status(201).json({
    success: true,
    message: 'Payment submitted for verification',
    data: { payment }
  });
}));

// @route   GET /api/payments/my
// @desc    Get user's payments
// @access  Private
router.get('/my', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const payments = await Payment.find({ user: req.user._id })
    .populate('order', 'orderNumber status')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Payment.countDocuments({ user: req.user._id });

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('order', 'orderNumber items status')
    .populate('user', 'firstName lastName email');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Check authorization
  if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  res.json({
    success: true,
    data: { payment }
  });
}));

// @route   GET /api/payments
// @desc    Get all payments (admin)
// @access  Private/Admin
router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, method } = req.query;

  const query = {};
  if (status) query.status = status;
  if (method) query.method = method;

  const payments = await Payment.find(query)
    .populate('user', 'firstName lastName email phone')
    .populate('order', 'orderNumber')
    .populate('verifiedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Payment.countDocuments(query);

  res.json({
    success: true,
    data: {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   PUT /api/payments/:id/approve
// @desc    Approve payment (admin)
// @access  Private/Admin
router.put('/:id/approve', protect, admin, auditLog('APPROVE_PAYMENT'), asyncHandler(async (req, res) => {
  const { notes } = req.body;

  const payment = await Payment.findById(req.params.id)
    .populate('order');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  await payment.approve(req.user._id, notes);

  // Update order status
  const order = payment.order;
  order.status = 'confirmed';
  order.payment.status = 'completed';
  order.payment.paidAt = new Date();
  await order.save();

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user}`).emit('payment_approved', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status
    });
  }

  res.json({
    success: true,
    message: 'Payment approved successfully',
    data: { payment, order }
  });
}));

// @route   PUT /api/payments/:id/reject
// @desc    Reject payment (admin)
// @access  Private/Admin
router.put('/:id/reject', protect, admin, auditLog('REJECT_PAYMENT'), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    throw new AppError('Rejection reason is required', 400);
  }

  const payment = await Payment.findById(req.params.id)
    .populate('order');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  await payment.reject(req.user._id, reason);

  // Update order status
  const order = payment.order;
  order.status = 'cancelled';
  order.payment.status = 'failed';
  order.cancellation = {
    reason: `Payment rejected: ${reason}`,
    cancelledBy: req.user._id,
    cancelledAt: new Date()
  };
  await order.save();

  // Restore stock
  for (const item of order.items) {
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }
    });
  }

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user}`).emit('payment_rejected', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      reason
    });
  }

  res.json({
    success: true,
    message: 'Payment rejected',
    data: { payment, order }
  });
}));

// @route   POST /api/payments/verify
// @desc    Verify payment transaction
// @access  Private
router.post('/verify', protect, asyncHandler(async (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    throw new AppError('Payment reference is required', 400);
  }

  const payment = await Payment.findOne({ reference })
    .populate('order');

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  res.json({
    success: true,
    data: {
      payment: {
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        createdAt: payment.createdAt
      }
    }
  });
}));

export default router;
