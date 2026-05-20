import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { auditLog } from '../middleware/logger.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    rating,
    brand,
    search,
    featured,
    sale
  } = req.query;

  const query = { isDeleted: false };

  // Search
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { tags: searchRegex }
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  // Brand filter
  if (brand) {
    query.brand = new RegExp(brand, 'i');
  }

  // Featured filter
  if (featured === 'true') {
    query.isFeatured = true;
  }

  // Sale filter
  if (sale === 'true') {
    query.isOnSale = true;
  }

  // Only show active products for non-admin
  if (!req.user || req.user.role === 'customer') {
    query.isActive = true;
  }

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug description')
    .populate('reviews', 'rating content user')
    .populate('createdBy', 'firstName lastName');

  if (!product || product.isDeleted) {
    throw new AppError('Product not found', 404);
  }

  // Increment view count
  product.metadata.views += 1;
  await product.save();

  res.json({
    success: true,
    data: { product }
  });
}));

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', protect, admin, auditLog('CREATE_PRODUCT'), asyncHandler(async (req, res) => {
  const product = await Product.create({
    ...req.body,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
}));

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, admin, auditLog('UPDATE_PRODUCT'), asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
}));

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private/Admin
router.delete('/:id', protect, admin, auditLog('DELETE_PRODUCT'), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.isDeleted = true;
  await product.save();

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
}));

// @route   POST /api/products/:id/review
// @desc    Add product review
// @access  Private
router.post('/:id/review', protect, asyncHandler(async (req, res) => {
  const { rating, title, content } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if user already reviewed
  const existingReview = await mongoose.model('Review').findOne({
    product: product._id,
    user: req.user._id
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  const review = await mongoose.model('Review').create({
    product: product._id,
    user: req.user._id,
    rating,
    title,
    content,
    isVerifiedPurchase: true // TODO: Check if user purchased this product
  });

  product.reviews.push(review._id);
  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: { review }
  });
}));

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search/:query', asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const products = await Product.searchProducts(query, {
    page: parseInt(page),
    limit: parseInt(limit)
  });

  const total = await Product.getProductCount(query);

  res.json({
    success: true,
    data: {
      products,
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
