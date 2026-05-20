import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { auditLog } from '../middleware/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for category images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/categories/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { parent, active, includeProducts } = req.query;
  
  const query = {};
  if (parent) query.parent = parent === 'null' ? null : parent;
  if (active === 'true') query.isActive = true;

  let categoriesQuery = Category.find(query)
    .populate('parent', 'name slug')
    .sort({ order: 1, name: 1 });

  if (includeProducts === 'true') {
    categoriesQuery = categoriesQuery.populate({
      path: 'products',
      match: { isActive: true, isDeleted: false },
      select: 'name price images thumbnail rating'
    });
  }

  const categories = await categoriesQuery.lean();

  res.json({
    success: true,
    data: { categories }
  });
}));

// @route   GET /api/categories/tree
// @desc    Get category tree
// @access  Public
router.get('/tree', asyncHandler(async (req, res) => {
  const tree = await Category.getCategoryTree();
  res.json({
    success: true,
    data: { tree }
  });
}));

// @route   GET /api/categories/:id
// @desc    Get single category with products
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parent', 'name slug')
    .populate('children', 'name slug image productCount');

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Get products in this category
  const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
  
  const products = await Product.find({
    category: req.params.id,
    isActive: true,
    isDeleted: false
  })
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Product.countDocuments({
    category: req.params.id,
    isActive: true,
    isDeleted: false
  });

  res.json({
    success: true,
    data: { 
      category,
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

// @route   POST /api/categories
// @desc    Create category
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), auditLog('CREATE_CATEGORY'), asyncHandler(async (req, res) => {
  const { name, description, parent, order, isFeatured, icon } = req.body;

  // Check if category already exists
  const existing = await Category.findOne({ 
    name: new RegExp(`^${name}$`, 'i') 
  });

  if (existing) {
    throw new AppError('Category with this name already exists', 400);
  }

  const categoryData = {
    name,
    description,
    parent: parent || null,
    order: order || 0,
    isFeatured: isFeatured === 'true',
    icon: icon || ''
  };

  // Add image if uploaded
  if (req.file) {
    categoryData.image = {
      url: `/uploads/categories/${req.file.filename}`,
      publicId: req.file.filename
    };
  }

  const category = await Category.create(categoryData);

  // Update parent's children array
  if (parent) {
    await Category.findByIdAndUpdate(parent, {
      $push: { children: category._id }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
}));

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), auditLog('UPDATE_CATEGORY'), asyncHandler(async (req, res) => {
  const { name, description, parent, order, isFeatured, icon } = req.body;

  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const updateData = {
    name,
    description,
    parent: parent || null,
    order,
    isFeatured: isFeatured === 'true',
    icon
  };

  // Add image if uploaded
  if (req.file) {
    updateData.image = {
      url: `/uploads/categories/${req.file.filename}`,
      publicId: req.file.filename
    };
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category: updatedCategory }
  });
}));

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private/Admin
router.delete('/:id', protect, admin, auditLog('DELETE_CATEGORY'), asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    throw new AppError(`Cannot delete category with ${productCount} products. Move or delete products first.`, 400);
  }

  // Check if category has children
  if (category.children && category.children.length > 0) {
    throw new AppError('Cannot delete category with subcategories', 400);
  }

  // Remove from parent's children array
  if (category.parent) {
    await Category.findByIdAndUpdate(category.parent, {
      $pull: { children: category._id }
    });
  }

  await category.deleteOne();

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
}));

// @route   POST /api/categories/:id/banner
// @desc    Upload category banner
// @access  Private/Admin
router.post('/:id/banner', protect, admin, upload.single('banner'), auditLog('UPDATE_CATEGORY'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Banner image is required', 400);
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  category.banner = {
    url: `/uploads/categories/${req.file.filename}`,
    publicId: req.file.filename
  };

  await category.save();

  res.json({
    success: true,
    message: 'Banner uploaded successfully',
    data: { category }
  });
}));

export default router;
