import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  
  // User Information
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  
  // Action Details
  action: {
    type: String,
    required: true,
    maxlength: 200
  },
  actionType: {
    type: String,
    enum: [
      'CREATE', 'READ', 'UPDATE', 'DELETE', 
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
      'EXPORT', 'IMPORT', 'BACKUP', 'RESTORE',
      'PERMISSION_CHANGE', 'PASSWORD_CHANGE', 'PASSWORD_RESET',
      'SYSTEM_CONFIG', 'DATA_MIGRATION', 'BULK_OPERATION',
      'PRINT', 'EMAIL', 'SMS', 'NOTIFICATION',
      'PAYMENT', 'REFUND', 'BILLING',
      'PRESCRIPTION', 'DIAGNOSIS', 'TREATMENT',
      'APPOINTMENT', 'ADMISSION', 'DISCHARGE',
      'INVENTORY', 'STOCK_ADJUSTMENT', 'MEDICINE_DISPENSED',
      'REPORT_GENERATED', 'ANALYTICS_VIEWED',
      'SECURITY_ALERT', 'SYSTEM_ERROR', 'DATA_BREACH',
      'OTHER'
    ],
    required: true
  },
  
  // Resource Information
  resourceType: {
    type: String,
    enum: [
      'User', 'Patient', 'Doctor', 'Appointment', 'MedicalRecord',
      'Billing', 'Medicine', 'Message', 'AuditLog',
      'System', 'Configuration', 'Report', 'Backup',
      'Session', 'Permission', 'Role', 'Department'
    ]
  },
  resourceId: {
    type: String // Can be ObjectId or custom ID
  },
  resourceName: String, // Human readable name
  
  // Request Information
  httpMethod: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
  },
  endpoint: String,
  requestBody: mongoose.Schema.Types.Mixed, // Sanitized request data
  responseStatus: Number,
  responseTime: Number, // in milliseconds
  
  // Session and Device Information
  sessionId: String,
  deviceInfo: {
    userAgent: String,
    browser: String,
    browserVersion: String,
    os: String,
    osVersion: String,
    device: String,
    isMobile: Boolean,
    isTablet: Boolean,
    isDesktop: Boolean
  },
  
  // Network Information
  ipAddress: {
    type: String,
    required: true
  },
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
    timezone: String
  },
  
  // Data Changes (for UPDATE operations)
  changes: {
    before: mongoose.Schema.Types.Mixed, // Previous values
    after: mongoose.Schema.Types.Mixed,  // New values
    fields: [String] // List of changed fields
  },
  
  // Security Information
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  securityFlags: [{
    type: String,
    enum: [
      'SUSPICIOUS_ACTIVITY', 'MULTIPLE_FAILED_LOGINS', 'UNUSUAL_LOCATION',
      'PRIVILEGE_ESCALATION', 'BULK_DATA_ACCESS', 'AFTER_HOURS_ACCESS',
      'SENSITIVE_DATA_ACCESS', 'ADMIN_ACTION', 'SYSTEM_MODIFICATION',
      'DATA_EXPORT', 'UNAUTHORIZED_ACCESS_ATTEMPT'
    ]
  }],
  
  // Business Context
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Billing"
  },
  
  // Compliance and Legal
  complianceFlags: [{
    type: String,
    enum: [
      'HIPAA_RELEVANT', 'GDPR_RELEVANT', 'AUDIT_REQUIRED',
      'PATIENT_DATA_ACCESS', 'FINANCIAL_DATA_ACCESS',
      'MEDICAL_RECORD_ACCESS', 'PRESCRIPTION_ACCESS',
      'SENSITIVE_OPERATION', 'REGULATORY_REPORTING'
    ]
  }],
  retentionPeriod: {
    type: Number, // Days to retain this log
    default: 2555 // 7 years default for medical records
  },
  
  // Error Information (for failed operations)
  error: {
    message: String,
    code: String,
    stack: String, // Sanitized stack trace
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL']
    }
  },
  
  // Additional Context
  description: String,
  tags: [String], // For categorization and searching
  metadata: mongoose.Schema.Types.Mixed, // Additional context data
  
  // Workflow Information
  workflowId: String,
  workflowStep: String,
  parentLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AuditLog"
  },
  
  // Performance Metrics
  performanceMetrics: {
    executionTime: Number, // milliseconds
    memoryUsage: Number,   // bytes
    cpuUsage: Number,      // percentage
    databaseQueries: Number,
    cacheHits: Number,
    cacheMisses: Number
  },
  
  // Notification and Alerting
  alertSent: {
    type: Boolean,
    default: false
  },
  alertLevel: {
    type: String,
    enum: ['NONE', 'INFO', 'WARNING', 'CRITICAL'],
    default: 'NONE'
  },
  notificationsSent: [{
    type: {
      type: String,
      enum: ['EMAIL', 'SMS', 'PUSH', 'SLACK', 'WEBHOOK']
    },
    recipient: String,
    sentAt: Date,
    status: {
      type: String,
      enum: ['SENT', 'FAILED', 'PENDING']
    }
  }],
  
  // Data Integrity
  checksum: String, // For tamper detection
  signature: String, // Digital signature
  verified: {
    type: Boolean,
    default: true
  },
  
  // Archival Information
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archiveLocation: String,
  
  // System Information
  serverInfo: {
    hostname: String,
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'production'
    },
    version: String,
    buildNumber: String
  },
  
  // Timestamp (using createdAt from timestamps: true)
  logTimestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance and querying
AuditLogSchema.index({ logId: 1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ actionType: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ ipAddress: 1 });
AuditLogSchema.index({ riskLevel: 1 });
AuditLogSchema.index({ securityFlags: 1 });
AuditLogSchema.index({ complianceFlags: 1 });
AuditLogSchema.index({ patientId: 1, createdAt: -1 });
AuditLogSchema.index({ sessionId: 1 });
AuditLogSchema.index({ logTimestamp: -1 });
AuditLogSchema.index({ isArchived: 1, createdAt: -1 });

// Compound indexes for common queries
AuditLogSchema.index({ userId: 1, actionType: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, actionType: 1, createdAt: -1 });
AuditLogSchema.index({ riskLevel: 1, alertSent: 1 });

// TTL index for automatic deletion (based on retention period)
AuditLogSchema.index({ 
  createdAt: 1 
}, { 
  expireAfterSeconds: 0, // Will be calculated based on retentionPeriod
  partialFilterExpression: { isArchived: false }
});

// Virtual for log age
AuditLogSchema.virtual('logAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffInDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return diffInDays;
});

// Virtual for risk assessment
AuditLogSchema.virtual('riskAssessment').get(function() {
  let score = 0;
  
  // Base risk by action type
  const highRiskActions = ['DELETE', 'PERMISSION_CHANGE', 'SYSTEM_CONFIG', 'DATA_MIGRATION'];
  const mediumRiskActions = ['UPDATE', 'EXPORT', 'BULK_OPERATION'];
  
  if (highRiskActions.includes(this.actionType)) score += 3;
  else if (mediumRiskActions.includes(this.actionType)) score += 2;
  else score += 1;
  
  // Additional risk factors
  if (this.securityFlags.length > 0) score += this.securityFlags.length;
  if (this.error && this.error.severity === 'CRITICAL') score += 2;
  if (this.userRole === 'super-admin') score += 1;
  
  return {
    score,
    level: score >= 5 ? 'CRITICAL' : score >= 3 ? 'HIGH' : score >= 2 ? 'MEDIUM' : 'LOW'
  };
});

// Pre-save middleware
AuditLogSchema.pre('save', function(next) {
  // Generate logId if not provided
  if (!this.logId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.logId = `LOG${timestamp}${random}`;
  }
  
  // Set logTimestamp
  if (!this.logTimestamp) {
    this.logTimestamp = new Date();
  }
  
  // Auto-calculate risk level if not set
  if (!this.riskLevel || this.riskLevel === 'LOW') {
    const assessment = this.riskAssessment;
    this.riskLevel = assessment.level;
  }
  
  // Generate checksum for integrity
  if (!this.checksum) {
    const crypto = require('crypto');
    const data = `${this.userId}${this.action}${this.actionType}${this.ipAddress}${this.logTimestamp}`;
    this.checksum = crypto.createHash('sha256').update(data).digest('hex');
  }
  
  next();
});

// Method to add security flag
AuditLogSchema.methods.addSecurityFlag = function(flag) {
  if (!this.securityFlags.includes(flag)) {
    this.securityFlags.push(flag);
    this.riskLevel = this.riskAssessment.level;
  }
  return this.save();
};

// Method to add compliance flag
AuditLogSchema.methods.addComplianceFlag = function(flag) {
  if (!this.complianceFlags.includes(flag)) {
    this.complianceFlags.push(flag);
  }
  return this.save();
};

// Method to send alert
AuditLogSchema.methods.sendAlert = function(alertLevel = 'WARNING') {
  this.alertSent = true;
  this.alertLevel = alertLevel;
  // Here you would integrate with your notification system
  return this.save();
};

// Method to archive log
AuditLogSchema.methods.archive = function(location) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archiveLocation = location;
  return this.save();
};

// Method to verify integrity
AuditLogSchema.methods.verifyIntegrity = function() {
  const crypto = require('crypto');
  const data = `${this.userId}${this.action}${this.actionType}${this.ipAddress}${this.logTimestamp}`;
  const calculatedChecksum = crypto.createHash('sha256').update(data).digest('hex');
  
  this.verified = (calculatedChecksum === this.checksum);
  return this.verified;
};

// Static method to create audit log
AuditLogSchema.statics.createLog = function(logData) {
  const auditLog = new this(logData);
  return auditLog.save();
};

// Static method to find logs by user
AuditLogSchema.statics.findByUser = function(userId, limit = 100) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name role department');
};

// Static method to find security alerts
AuditLogSchema.statics.findSecurityAlerts = function(timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  
  return this.find({
    createdAt: { $gte: since },
    $or: [
      { riskLevel: { $in: ['HIGH', 'CRITICAL'] } },
      { securityFlags: { $exists: true, $ne: [] } },
      { 'error.severity': 'CRITICAL' }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to get activity summary
AuditLogSchema.statics.getActivitySummary = function(startDate, endDate, userId = null) {
  const matchQuery = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (userId) {
    matchQuery.userId = userId;
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          actionType: '$actionType',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        riskLevels: { $push: '$riskLevel' }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        activities: {
          $push: {
            actionType: '$_id.actionType',
            count: '$count',
            uniqueUserCount: { $size: '$uniqueUsers' },
            riskDistribution: '$riskLevels'
          }
        },
        totalActivities: { $sum: '$count' }
      }
    },
    { $sort: { _id: -1 } }
  ]);
};

// Static method to find compliance-relevant logs
AuditLogSchema.statics.findComplianceLogs = function(complianceType, startDate, endDate) {
  return this.find({
    complianceFlags: complianceType,
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
  .populate('userId', 'name role department')
  .populate('patientId', 'name patientId')
  .sort({ createdAt: -1 });
};

// Static method to detect anomalies
AuditLogSchema.statics.detectAnomalies = function(userId, timeframe = 24) {
  const since = new Date(Date.now() - timeframe * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        userId: userId,
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$createdAt' },
          actionType: '$actionType'
        },
        count: { $sum: 1 },
        uniqueIPs: { $addToSet: '$ipAddress' },
        locations: { $addToSet: '$location.city' }
      }
    },
    {
      $match: {
        $or: [
          { count: { $gt: 50 } }, // High activity
          { 'uniqueIPs.1': { $exists: true } }, // Multiple IPs
          { 'locations.1': { $exists: true } }  // Multiple locations
        ]
      }
    }
  ]);
};

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
