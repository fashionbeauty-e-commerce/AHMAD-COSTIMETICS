import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { auditLog } from '../middleware/logger.js';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user orders or all orders (admin)
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus } = req.query;

  const query = {};

  // Admin can see all orders, customers only their own
  if (req.user.role === 'customer') {
    query.user = req.user._id;
  }

  // Status filters
  if (status) query.status = status;
  if (paymentStatus) query['payment.status'] = paymentStatus;

  const orders = await Order.find(query)
    .populate('user', 'firstName lastName email phone')
    .populate('items.product', 'name images price')
    .populate('payment')
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

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'firstName lastName email phone')
    .populate('items.product', 'name images price description')
    .populate('payment')
    .populate('shipping.trackingNumber');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check authorization
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this order', 403);
  }

  res.json({
    success: true,
    data: { order }
  });
}));

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { items, shippingAddress, billingAddress, payment, shipping, coupon } = req.body;

  if (!items || items.length === 0) {
    throw new AppError('Please add items to your order', 400);
  }

  // Validate products and calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product || !product.isActive || product.isDeleted) {
      throw new AppError(`Product ${item.product} is not available`, 400);
    }

    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || product.thumbnail,
      quantity: item.quantity,
      price: product.price,
      size: item.size,
      color: item.color,
      subtotal: itemSubtotal
    });

    // Reduce stock
    product.stock -= item.quantity;
    product.metadata.soldCount += item.quantity;
    await product.save();
  }

  // Calculate pricing
  let shippingCost = shipping?.method === 'express' ? 15 : shipping?.method === 'overnight' ? 30 : 0;
  if (subtotal > 50) shippingCost = 0; // Free shipping over $50

  const tax = subtotal * 0.08; // 8% tax
  let discount = 0;

  // Apply coupon if provided
  if (coupon && coupon.code) {
    const Coupon = mongoose.model('Coupon');
    const couponDoc = await Coupon.findOne({ 
      code: coupon.code.toUpperCase(),
      isActive: true
    });

    if (couponDoc) {
      const validity = couponDoc.isValid();
      if (validity.valid) {
        const userCanUse = await couponDoc.canUserUse(req.user._id);
        if (userCanUse.canUse) {
          const calc = couponDoc.calculateDiscount(subtotal);
          discount = calc.discount;
          
          // Mark coupon as used
          await couponDoc.markAsUsed(req.user._id, null);
        }
      }
    }
  }

  const total = subtotal + shippingCost + tax - discount;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    payment: {
      method: payment?.method || 'card',
      status: 'pending'
    },
    pricing: {
      subtotal,
      shipping: shippingCost,
      tax,
      discount,
      total
    },
    shipping: {
      method: shipping?.method || 'standard'
    },
    coupon: coupon ? {
      code: coupon.code.toUpperCase(),
      discount
    } : undefined,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Add order to user
  await req.user.updateOne({
    $push: { orders: order._id }
  });

  // Emit socket event for realtime notification
  const io = req.app.get('io');
  if (io) {
    io.to('admin_room').emit('new_order', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      total: order.pricing.total,
      customer: req.user.firstName + ' ' + req.user.lastName,
      email: req.user.email,
      items: order.items.length,
      paymentMethod: order.payment.method
    });
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully. Payment verification pending.',
    data: { order }
  });
}));

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin)
// @access  Private/Admin
router.put('/:id/status', protect, admin, auditLog('UPDATE_ORDER'), asyncHandler(async (req, res) => {
  const { status, message, trackingNumber, carrier } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('user');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await order.updateStatus(status, message);

  if (trackingNumber) {
    order.shipping.trackingNumber = trackingNumber;
    order.shipping.carrier = carrier;
    await order.save();
  }

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user._id}`).emit('order_status_changed', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      message,
      trackingNumber
    });
  }

  res.json({
    success: true,
    message: 'Order status updated',
    data: { order }
  });
}));

// @route   PUT /api/orders/:id/approve-payment
// @desc    Approve order payment (admin)
// @access  Private/Admin
router.put('/:id/approve-payment', protect, admin, auditLog('APPROVE_PAYMENT'), asyncHandler(async (req, res) => {
  const { notes } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('user');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Update order status
  order.status = 'processing';
  order.payment.status = 'completed';
  order.payment.paidAt = new Date();
  order.statusHistory.push({
    status: 'payment_approved',
    message: notes || 'Payment verified and approved',
    notified: false
  });

  await order.save();

  // Update payment record
  await Payment.findOneAndUpdate(
    { order: order._id },
    {
      status: 'completed',
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      verificationNotes: notes
    }
  );

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user._id}`).emit('payment_approved', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status
    });
  }

  res.json({
    success: true,
    message: 'Payment approved. Order is now processing.',
    data: { order }
  });
}));

// @route   PUT /api/orders/:id/reject-payment
// @desc    Reject order payment (admin)
// @access  Private/Admin
router.put('/:id/reject-payment', protect, admin, auditLog('REJECT_PAYMENT'), asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    throw new AppError('Rejection reason is required', 400);
  }

  const order = await Order.findById(req.params.id)
    .populate('user');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Cancel order
  order.status = 'cancelled';
  order.payment.status = 'failed';
  order.cancellation = {
    reason: `Payment rejected: ${reason}`,
    cancelledBy: req.user._id,
    cancelledAt: new Date()
  };
  order.statusHistory.push({
    status: 'payment_rejected',
    message: reason,
    notified: false
  });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, 'metadata.soldCount': -item.quantity }
    });
  }

  await order.save();

  // Update payment record
  await Payment.findOneAndUpdate(
    { order: order._id },
    {
      status: 'rejected',
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      rejectionReason: reason
    }
  );

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${order.user._id}`).emit('payment_rejected', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      reason
    });
  }

  res.json({
    success: true,
    message: 'Payment rejected. Order cancelled.',
    data: { order }
  });
}));

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check authorization
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to cancel this order', 403);
  }

  // Check if order can be cancelled
  if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
    throw new AppError('Cannot cancel order that has been shipped', 400);
  }

  order.status = 'cancelled';
  order.cancellation = {
    reason,
    cancelledBy: req.user._id,
    cancelledAt: new Date()
  };

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, 'metadata.soldCount': -item.quantity }
    });
  }

  await order.save();

  res.json({
    success: true,
    message: 'Order cancelled successfully'
  });
}));

// @route   GET /api/orders/my/orders
// @desc    Get current user's orders
// @access  Private
router.get('/my/orders', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    data: { orders }
  });
}));

// @route   GET /api/orders/stats
// @desc    Get order statistics (admin)
// @access  Private/Admin
router.get('/stats', protect, admin, asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' }
      }
    }
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: today }
  });

  const todayRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } }
  ]);

  res.json({
    success: true,
    data: {
      byStatus: stats,
      today: {
        orders: todayOrders,
        revenue: todayRevenue[0]?.total || 0
      }
    }
  });
}));

export default router;
