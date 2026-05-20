import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  image: {
    url: String,
    publicId: String,
    alt: String
  },
  icon: {
    type: String,
    default: ''
  },
  level: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  productCount: {
    type: Number,
    default: 0
  },
  metadata: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1, order: 1 });

// Pre-save to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Pre-remove to update parent's children array
categorySchema.pre('remove', async function(next) {
  if (this.parent) {
    await mongoose.model('Category').findByIdAndUpdate(this.parent, {
      $pull: { children: this._id }
    });
  }
  next();
});

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function(parentId = null) {
  const categories = await this.find({ parent: parentId, isActive: true })
    .sort({ order: 1, name: 1 })
    .lean();
  
  for (const category of categories) {
    category.children = await this.getCategoryTree(category._id);
  }
  
  return categories;
};

export default mongoose.model('Category', categorySchema);
