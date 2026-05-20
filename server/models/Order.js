import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    image: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true
    },
    size: String,
    color: String,
    subtotal: Number
  }],
  shippingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String,
    email: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String,
    email: String
  },
  payment: {
    method: {
      type: String,
      enum: ['card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'mobile_money'],
      required: true
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date,
    cardLast4: String,
    cardBrand: String
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    shipping: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      default: 0
    }
  },
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard'
    },
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notified: {
      type: Boolean,
      default: false
    }
  }],
  notes: {
    customer: String,
    admin: String
  },
  coupon: {
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  },
  refund: {
    status: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'processed'],
      default: 'none'
    },
    reason: String,
    amount: Number,
    processedAt: Date
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date
  },
  ip: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });

// Pre-save to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
    
    // Add initial status to history
    this.statusHistory.push({
      status: this.status,
      message: 'Order placed successfully',
      notified: false
    });
  }
  next();
});

// Update status method
orderSchema.methods.updateStatus = async function(status, message, notify = true) {
  this.status = status;
  this.statusHistory.push({
    status,
    message: message || `Order status changed to ${status}`,
    notified: !notify
  });
  
  if (status === 'shipped') {
    this.shipping.shippedAt = new Date();
  }
  
  if (status === 'delivered') {
    this.shipping.deliveredAt = new Date();
  }
  
  await this.save();
  return this;
};

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.pricing.total = this.pricing.subtotal + this.pricing.shipping + this.pricing.tax - this.pricing.discount;
  return this;
};

// Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

export default mongoose.model('Order', orderSchema);
