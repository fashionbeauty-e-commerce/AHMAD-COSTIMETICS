import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get reviews for a product
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { product, page = 1, limit = 10, rating } = req.query;

  const query = { isApproved: true };
  if (product) query.product = product;
  if (rating) query.rating = parseInt(rating);

  const reviews = await Review.find(query)
    .populate('user', 'firstName lastName avatar')
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Review.countDocuments(query);

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   POST /api/reviews
// @desc    Create review
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { product, rating, title, content } = req.body;

  // Check if product exists
  const productDoc = await Product.findById(product);
  if (!productDoc) {
    throw new AppError('Product not found', 404);
  }

  // Check if user already reviewed
  const existing = await Review.findOne({
    product,
    user: req.user._id
  });

  if (existing) {
    throw new AppError('You have already reviewed this product', 400);
  }

  const review = await Review.create({
    product,
    user: req.user._id,
    rating,
    title,
    content,
    isVerifiedPurchase: true // TODO: Verify purchase
  });

  res.status(201).json({
    success: true,
    data: { review }
  });
}));

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  Object.assign(review, req.body);
  await review.save();

  res.json({
    success: true,
    data: { review }
  });
}));

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  await review.deleteOne();

  res.json({
    success: true,
    message: 'Review deleted'
  });
}));

// @route   PUT /api/reviews/:id/approve
// @desc    Approve review (admin)
// @access  Private/Admin
router.put('/:id/approve', protect, admin, asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      isApproved: true,
      status: 'approved'
    },
    { new: true }
  ).populate('user', 'firstName lastName email');

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  res.json({
    success: true,
    data: { review }
  });
}));

// @route   PUT /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Private
router.put('/:id/helpful', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Toggle helpful
  const index = review.helpful.indexOf(req.user._id);
  if (index > -1) {
    review.helpful.splice(index, 1);
  } else {
    review.helpful.push(req.user._id);
    // Remove from unhelpful if present
    const unhelpfulIndex = review.unhelpful.indexOf(req.user._id);
    if (unhelpfulIndex > -1) {
      review.unhelpful.splice(unhelpfulIndex, 1);
    }
  }

  await review.save();

  res.json({
    success: true,
    data: { review }
  });
}));

export default router;
