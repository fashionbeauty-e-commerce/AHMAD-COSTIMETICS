import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user: user.getPublicProfile() }
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { firstName, lastName, phone, avatar },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: user.getPublicProfile() }
  });
}));

// ============ CART ENDPOINTS ============

// @route   GET /api/users/cart
// @desc    Get user cart
// @access  Private
router.get('/cart', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');

  res.json({
    success: true,
    data: { cart: user.cart }
  });
}));

// @route   POST /api/users/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/cart/add', protect, asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size, color } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  const user = await User.findById(req.user._id);

  // Check if item already in cart with same size/color
  const existingItem = user.cart.find(item =>
    item.product.toString() === productId &&
    item.size === size &&
    item.color === color
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    user.cart.push({ product: productId, quantity, size, color });
  }

  await user.save();
  await user.populate('cart.product');

  res.status(201).json({
    success: true,
    message: 'Item added to cart',
    data: { cart: user.cart }
  });
}));

// @route   PUT /api/users/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/cart/:itemId', protect, asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  const user = await User.findById(req.user._id);
  const cartItem = user.cart.find(item => item._id.toString() === req.params.itemId);

  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  cartItem.quantity = quantity;
  await user.save();
  await user.populate('cart.product');

  res.json({
    success: true,
    message: 'Cart updated',
    data: { cart: user.cart }
  });
}));

// @route   DELETE /api/users/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/cart/:itemId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.cart = user.cart.filter(item => item._id.toString() !== req.params.itemId);
  await user.save();
  await user.populate('cart.product');

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: { cart: user.cart }
  });
}));

// @route   DELETE /api/users/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/cart', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();

  res.json({
    success: true,
    message: 'Cart cleared',
    data: { cart: [] }
  });
}));

// ============ WISHLIST ENDPOINTS ============

// @route   GET /api/users/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/wishlist', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');

  res.json({
    success: true,
    data: { wishlist: user.wishlist }
  });
}));

// @route   POST /api/users/wishlist/add
// @desc    Add product to wishlist
// @access  Private
router.post('/wishlist/add', protect, asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  const user = await User.findById(req.user._id);

  // Check if already in wishlist
  if (user.wishlist.includes(productId)) {
    throw new AppError('Product already in wishlist', 400);
  }

  user.wishlist.push(productId);
  await user.save();
  await user.populate('wishlist');

  res.status(201).json({
    success: true,
    message: 'Product added to wishlist',
    data: { wishlist: user.wishlist }
  });
}));

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/wishlist/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
  await user.save();
  await user.populate('wishlist');

  res.json({
    success: true,
    message: 'Product removed from wishlist',
    data: { wishlist: user.wishlist }
  });
}));

// @route   DELETE /api/users/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/wishlist', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = [];
  await user.save();

  res.json({
    success: true,
    message: 'Wishlist cleared',
    data: { wishlist: [] }
  });
}));

export default router;
