const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_login',
      'user_logout',
      'user_register',
      'user_update',
      'user_deactivate',
      'user_activate',
      'task_create',
      'task_update',
      'task_delete',
      'task_complete',
      'task_cancel',
      'file_upload',
      'file_download',
      'export_data',
      'admin_action',
      'system_event'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'task', 'file', 'system', 'export']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resource'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'error'],
    default: 'success'
  },
  errorMessage: {
    type: String
  },
  metadata: {
    browser: String,
    os: String,
    device: String,
    location: {
      country: String,
      city: String,
      timezone: String
    }
  },
  sessionId: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ status: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });

// Static method to log user action
auditLogSchema.statics.logAction = function(data) {
  const log = new this({
    user: data.userId,
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId,
    details: data.details || {},
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    status: data.status || 'success',
    errorMessage: data.errorMessage,
    metadata: data.metadata || {},
    sessionId: data.sessionId
  });
  
  return log.save();
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('user', 'username email profile.firstName profile.lastName');
};

// Static method to get system activity
auditLogSchema.statics.getSystemActivity = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 })
  .populate('user', 'username email role');
};

// Static method to get failed actions
auditLogSchema.statics.getFailedActions = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    status: { $in: ['failure', 'error'] },
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 })
  .populate('user', 'username email');
};

// Static method to get login attempts
auditLogSchema.statics.getLoginAttempts = function(userId, hours = 24) {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);
  
  return this.find({
    user: userId,
    action: { $in: ['user_login', 'user_logout'] },
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 });
};

// Static method to get resource activity
auditLogSchema.statics.getResourceActivity = function(resource, resourceId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    resource,
    resourceId,
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 })
  .populate('user', 'username email');
};

// Static method to get admin actions
auditLogSchema.statics.getAdminActions = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    action: 'admin_action',
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 })
  .populate('user', 'username email role');
};

// Static method to get export activities
auditLogSchema.statics.getExportActivities = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    action: 'export_data',
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 })
  .populate('user', 'username email');
};

// Static method to get security events
auditLogSchema.statics.getSecurityEvents = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    action: { $in: ['user_login', 'user_register', 'user_deactivate', 'user_activate'] },
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 })
  .populate('user', 'username email role');
};

module.exports = mongoose.model('AuditLog', auditLogSchema); 