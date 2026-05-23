import express from 'express';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { auditLog } from '../middleware/logger.js';
import { sendVerificationEmail } from '../utils/email.js';
import { getAdminEmails, getSuperAdminEmails } from '../utils/adminEmails.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Validation
  if (!email || !password || !firstName || !lastName) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (!validator.isEmail(email)) {
    throw new AppError('Please provide a valid email', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Check if admin email
  const normalizedEmail = email.toLowerCase().trim();
  const adminEmails = getAdminEmails();
  const superAdminEmails = getSuperAdminEmails();
  const isSuper = superAdminEmails.includes(normalizedEmail);
  const isAdmin = adminEmails.includes(normalizedEmail) || isSuper;

  // Create user
  const user = await User.create({
    email: normalizedEmail,
    password,
    firstName,
    lastName,
    phone,
    role: isSuper ? 'super_admin' : (isAdmin ? 'admin' : 'customer'),
    isAdmin
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw new AppError('Account is temporarily locked. Please try again later.', 403);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incLoginAttempts();
    throw new AppError('Invalid email or password', 401);
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide an email', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Don't reveal if user exists
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
    return;
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save();

  // TODO: Send email with reset token
  console.log('Password reset token:', resetToken);

  res.json({
    success: true,
    message: 'Password reset link sent to email',
    data: { resetToken } // Remove in production
  });
}));

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  const user = await User.findById(decoded.id);

  if (!user || user.resetPasswordToken !== token || user.resetPasswordExpire < Date.now()) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.getPublicProfile()
    }
  });
}));

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, auditLog('UPDATE_PROFILE'), asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { firstName, lastName, phone, avatar },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.getPublicProfile()
    }
  });
}));

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @route   POST /api/auth/clerk-sync
// @desc    Sync or create user from Clerk
// @access  Public (but requires Clerk token in body)
router.post('/clerk-sync', asyncHandler(async (req, res) => {
  const { email, firstName, lastName, clerkId, imageUrl } = req.body;

  if (!email || !clerkId) {
    throw new AppError('Email and clerkId are required', 400);
  }

  // Check if user exists
  let user = await User.findOne({ email: email.toLowerCase().trim() });

  // Admin and Super Admin check
  const normalizedEmail = email.toLowerCase().trim();
  const adminEmails = getAdminEmails();
  const superAdminEmails = getSuperAdminEmails();
  const isSuper = superAdminEmails.includes(normalizedEmail);
  const isAdmin = adminEmails.includes(normalizedEmail) || isSuper;

  if (user) {
    // Update existing user
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.avatar = imageUrl || user.avatar;
    user.clerkId = clerkId;
    user.isActive = true;
    
    // Promote to admin/super_admin if email matches and not already set
    if (isSuper && user.role !== 'super_admin') {
      user.role = 'super_admin';
      user.isAdmin = true;
    } else if (isAdmin && user.role === 'customer') {
      user.role = 'admin';
      user.isAdmin = true;
    }
    
    await user.save();
  } else {
    // Create new user
    user = await User.create({
      email: normalizedEmail,
      firstName: firstName || 'User',
      lastName: lastName || '',
      clerkId: clerkId,
      avatar: imageUrl || '',
      role: isSuper ? 'super_admin' : (isAdmin ? 'admin' : 'customer'),
      isAdmin,
      isActive: true,
      password: Math.random().toString(36).slice(-8) // Random password for Clerk users
    });
  }

  // Generate JWT token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'User synced successfully',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
}));

export default router;
