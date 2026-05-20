import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount cannot be negative']
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usageLimitPerUser: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' };
  if (now < this.startDate) return { valid: false, reason: 'Coupon has not started yet' };
  if (now > this.endDate) return { valid: false, reason: 'Coupon has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Coupon usage limit reached' };
  }
  
  return { valid: true };
};

// Check if user can use coupon
couponSchema.methods.canUserUse = async function(userId) {
  const userUsage = this.usedBy.filter(u => u.user.toString() === userId.toString());
  
  if (userUsage.length >= this.usageLimitPerUser) {
    return { canUse: false, reason: 'You have already used this coupon maximum times' };
  }
  
  return { canUse: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(orderTotal) {
  if (orderTotal < this.minOrderAmount) {
    return { discount: 0, reason: 'Minimum order amount not met' };
  }
  
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = orderTotal * (this.discountValue / 100);
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    discount = this.discountValue;
  }
  
  return { discount: Math.min(discount, orderTotal) };
};

// Mark coupon as used
couponSchema.methods.markAsUsed = async function(userId, orderId) {
  this.usedBy.push({
    user: userId,
    orderId,
    usedAt: new Date()
  });
  this.usedCount += 1;
  await this.save();
};

export default mongoose.model('Coupon', couponSchema);
