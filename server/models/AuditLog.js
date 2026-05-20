import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'CREATE_PRODUCT',
      'UPDATE_PRODUCT',
      'DELETE_PRODUCT',
      'CREATE_CATEGORY',
      'UPDATE_CATEGORY',
      'DELETE_CATEGORY',
      'CREATE_ORDER',
      'UPDATE_ORDER',
      'DELETE_ORDER',
      'APPROVE_PAYMENT',
      'REJECT_PAYMENT',
      'CREATE_COUPON',
      'UPDATE_COUPON',
      'DELETE_COUPON',
      'SEND_NOTIFICATION',
      'EXPORT_DATA',
      'CHANGE_SETTINGS',
      'VIEW_REPORT',
      'OTHER'
    ]
  },
  entity: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'super_admin'],
    required: true
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String,
    location: String
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  errorMessage: String,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  }
}, {
  timestamps: true
});

// Indexes
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });

// Auto-expire logs after 1 year (optional TTL index)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

// Static method to create log
auditLogSchema.statics.createLog = async function(data) {
  return await this.create(data);
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email');
};

// Static method to get recent activity
auditLogSchema.statics.getRecentActivity = async function(limit = 100) {
  return await this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'firstName lastName email role');
};

export default mongoose.model('AuditLog', auditLogSchema);
