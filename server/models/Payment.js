import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  method: {
    type: String,
    enum: ['stripe', 'paypal', 'airtel_money', 'mtn_money', 'bank_transfer', 'cash_on_delivery'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: [
      'pending',
      'payment_pending',
      'payment_approved',
      'payment_rejected',
      'processing',
      'completed',
      'failed',
      'refunded'
    ],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  reference: {
    type: String,
    unique: true,
    required: true
  },
  proofImage: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  mobileMoneyDetails: {
    phoneNumber: String,
    provider: String,
    transactionCode: String
  },
  bankTransferDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    depositDate: Date
  },
  stripeDetails: {
    paymentIntentId: String,
    chargeId: String,
    cardLast4: String,
    cardBrand: String
  },
  paypalDetails: {
    paymentId: String,
    payerId: String,
    payerEmail: String
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  verificationNotes: String,
  rejectionReason: String,
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ reference: 1 });
paymentSchema.index({ transactionId: 1 });

// Generate unique reference
paymentSchema.pre('save', async function(next) {
  if (!this.reference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.reference = `PAY-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Approve payment
paymentSchema.methods.approve = async function(adminId, notes = '') {
  this.status = 'payment_approved';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.verificationNotes = notes;
  await this.save();
  return this;
};

// Reject payment
paymentSchema.methods.reject = async function(adminId, reason) {
  this.status = 'payment_rejected';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.rejectionReason = reason;
  await this.save();
  return this;
};

export default mongoose.model('Payment', paymentSchema);
