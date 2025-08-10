import mongoose from "mongoose";

const TestReportSchema = new mongoose.Schema({
  // Unique Report Identifier
  reportId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    index: true
  },
  
  // References
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Patient",
    required: true,
    index: true
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    index: true
  },
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord"
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  
  // Test Information
  testName: {
    type: String,
    required: true,
    index: true
  },
  testCode: String,
  testCategory: {
    type: String,
    enum: ['Blood Test', 'Urine Test', 'Stool Test', 'X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'ECG', 'Echo', 'Endoscopy', 'Biopsy', 'Other'],
    required: true,
    index: true
  },
  testType: {
    type: String,
    enum: ['Laboratory', 'Radiology', 'Cardiology', 'Pathology', 'Other']
  },
  
  // Dates and Timeline
  orderedDate: {
    type: Date,
    required: true,
    index: true
  },
  sampleCollectedDate: Date,
  testPerformedDate: Date,
  reportGeneratedDate: {
    type: Date,
    default: Date.now
  },
  reportApprovedDate: Date,
  
  // Test Details
  testDetails: {
    indication: String, // Why the test was ordered
    clinicalHistory: String,
    technique: String, // How the test was performed
    contrast: {
      used: Boolean,
      type: String,
      amount: String
    },
    equipment: String,
    settings: String
  },
  
  // Sample Information (for lab tests)
  sampleInfo: {
    sampleType: {
      type: String,
      enum: ['Blood', 'Urine', 'Stool', 'Saliva', 'Tissue', 'Fluid', 'Other']
    },
    collectionMethod: String,
    collectionSite: String,
    volume: String,
    preservative: String,
    storageConditions: String,
    transportConditions: String
  },
  
  // Test Results
  results: [{
    parameter: {
      type: String,
      required: true
    },
    value: String,
    unit: String,
    normalRange: String,
    flag: {
      type: String,
      enum: ['Normal', 'High', 'Low', 'Critical', 'Abnormal', 'Positive', 'Negative']
    },
    method: String, // Testing method used
    notes: String
  }],
  
  // Imaging Results (for radiology)
  imagingResults: {
    findings: String,
    impression: String,
    recommendations: String,
    comparison: String, // Comparison with previous studies
    technique: String,
    limitations: String
  },
  
  // Overall Assessment
  overallResult: {
    type: String,
    enum: ['Normal', 'Abnormal', 'Inconclusive', 'Pending'],
    default: 'Pending'
  },
  interpretation: String,
  clinicalCorrelation: String,
  recommendations: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpInstructions: String,
  
  // Critical Values
  criticalValues: [{
    parameter: String,
    value: String,
    criticalRange: String,
    notifiedTo: String,
    notificationTime: Date,
    actionTaken: String
  }],
  
  // Quality Control
  qualityControl: {
    controlResults: String,
    calibrationStatus: String,
    instrumentQC: String,
    technicalComments: String
  },
  
  // Staff Information
  performedBy: {
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    radiologist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    pathologist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // Report Status
  status: {
    type: String,
    enum: ['Ordered', 'Sample Collected', 'In Progress', 'Completed', 'Reviewed', 'Approved', 'Cancelled', 'Amended'],
    default: 'Ordered',
    index: true
  },
  priority: {
    type: String,
    enum: ['Routine', 'Urgent', 'STAT'],
    default: 'Routine'
  },
  
  // Digital Files and Images
  attachments: [{
    type: {
      type: String,
      enum: ['Report PDF', 'Image', 'DICOM', 'Raw Data', 'Other']
    },
    filename: String,
    originalName: String,
    url: String,
    fileSize: Number,
    mimeType: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    },
    description: String,
    isPatientAccessible: {
      type: Boolean,
      default: true
    }
  }],
  
  // Patient Access Control
  patientAccess: {
    isAccessible: {
      type: Boolean,
      default: false // Reports need approval before patient access
    },
    accessGrantedDate: Date,
    accessRevokedDate: Date,
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloaded: Date,
    downloadHistory: [{
      downloadedAt: Date,
      downloadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      ipAddress: String,
      userAgent: String
    }],
    viewCount: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },
  
  // Notifications
  notifications: {
    patientNotified: {
      type: Boolean,
      default: false
    },
    patientNotificationDate: Date,
    doctorNotified: {
      type: Boolean,
      default: false
    },
    doctorNotificationDate: Date,
    criticalValueNotified: {
      type: Boolean,
      default: false
    },
    notificationMethod: {
      type: String,
      enum: ['Email', 'SMS', 'Phone', 'Portal', 'In-person']
    }
  },
  
  // Billing Integration
  billing: {
    testCost: Number,
    insuranceCovered: Boolean,
    copayAmount: Number,
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing"
    }
  },
  
  // External Lab Information
  externalLab: {
    isExternal: {
      type: Boolean,
      default: false
    },
    labName: String,
    labAddress: String,
    labContactNumber: String,
    labLicenseNumber: String,
    referenceNumber: String
  },
  
  // Amendments and Corrections
  amendments: [{
    amendmentDate: Date,
    amendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reason: String,
    originalValue: String,
    correctedValue: String,
    section: String, // Which section was amended
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }],
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['Created', 'Updated', 'Viewed', 'Downloaded', 'Approved', 'Amended', 'Shared']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    ipAddress: String
  }],
  
  // Reference Values and Standards
  referenceStandards: {
    methodology: String,
    referenceSource: String,
    lastUpdated: Date
  },
  
  // Notes
  notes: String,
  technicalNotes: String,
  internalNotes: String, // Not visible to patient
  
  // System Fields
  lastUpdated: { 
    type: Number, 
    default: Date.now,
    index: true
  },
  version: {
    type: Number,
    default: 1
  }
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.internalNotes;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
TestReportSchema.index({ patientId: 1, orderedDate: -1 });
TestReportSchema.index({ doctorId: 1, orderedDate: -1 });
TestReportSchema.index({ testCategory: 1, status: 1 });
TestReportSchema.index({ overallResult: 1 });
TestReportSchema.index({ priority: 1, status: 1 });

// Virtuals
TestReportSchema.virtual('turnaroundTime').get(function() {
  if (this.orderedDate && this.reportGeneratedDate) {
    const diffTime = Math.abs(this.reportGeneratedDate - this.orderedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Days
  }
  return null;
});

TestReportSchema.virtual('hasAbnormalResults').get(function() {
  return this.results.some(result => 
    ['High', 'Low', 'Critical', 'Abnormal', 'Positive'].includes(result.flag)
  );
});

TestReportSchema.virtual('hasCriticalValues').get(function() {
  return this.criticalValues.length > 0 || 
         this.results.some(result => result.flag === 'Critical');
});

// Pre-save middleware
TestReportSchema.pre('save', function(next) {
  // Generate reportId if not provided
  if (!this.reportId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.reportId = `RPT${timestamp}${random}`;
  }
  
  // Auto-approve patient access for normal results (configurable)
  if (this.status === 'Approved' && this.overallResult === 'Normal' && !this.hasCriticalValues) {
    this.patientAccess.isAccessible = true;
    this.patientAccess.accessGrantedDate = new Date();
  }
  
  // Update version for amendments
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Instance Methods
TestReportSchema.methods.grantPatientAccess = function() {
  this.patientAccess.isAccessible = true;
  this.patientAccess.accessGrantedDate = new Date();
  this.patientAccess.accessRevokedDate = undefined;
  return this.save();
};

TestReportSchema.methods.revokePatientAccess = function() {
  this.patientAccess.isAccessible = false;
  this.patientAccess.accessRevokedDate = new Date();
  return this.save();
};

TestReportSchema.methods.addDownloadRecord = function(userId, ipAddress, userAgent) {
  this.patientAccess.downloadCount += 1;
  this.patientAccess.lastDownloaded = new Date();
  this.patientAccess.downloadHistory.push({
    downloadedAt: new Date(),
    downloadedBy: userId,
    ipAddress,
    userAgent
  });
  
  // Keep only last 10 download records
  if (this.patientAccess.downloadHistory.length > 10) {
    this.patientAccess.downloadHistory = this.patientAccess.downloadHistory.slice(-10);
  }
  
  return this.save();
};

TestReportSchema.methods.recordView = function() {
  this.patientAccess.viewCount += 1;
  this.patientAccess.lastViewed = new Date();
  return this.save();
};

TestReportSchema.methods.addAmendment = function(amendmentData, amendedBy, approvedBy) {
  this.amendments.push({
    ...amendmentData,
    amendmentDate: new Date(),
    amendedBy,
    approvedBy
  });
  
  this.status = 'Amended';
  return this.save();
};

TestReportSchema.methods.addCriticalValue = function(criticalData) {
  this.criticalValues.push({
    ...criticalData,
    notificationTime: new Date()
  });
  
  this.notifications.criticalValueNotified = true;
  return this.save();
};

TestReportSchema.methods.approve = function(approvedBy) {
  this.status = 'Approved';
  this.approvedBy = approvedBy;
  this.reportApprovedDate = new Date();
  
  // Auto-grant patient access for normal results
  if (this.overallResult === 'Normal' && !this.hasCriticalValues) {
    this.grantPatientAccess();
  }
  
  return this.save();
};

TestReportSchema.methods.addAuditEntry = function(action, userId, details, ipAddress) {
  this.auditTrail.push({
    action,
    performedBy: userId,
    details,
    ipAddress,
    timestamp: new Date()
  });
  return this.save();
};

TestReportSchema.methods.notifyPatient = function(method = 'Portal') {
  this.notifications.patientNotified = true;
  this.notifications.patientNotificationDate = new Date();
  this.notifications.notificationMethod = method;
  return this.save();
};

// Static Methods
TestReportSchema.statics.findByPatient = function(patientId, limit = 20) {
  return this.find({ patientId })
    .populate('doctorId', 'name specialization')
    .sort({ orderedDate: -1 })
    .limit(limit);
};

TestReportSchema.statics.findPatientAccessibleReports = function(patientId) {
  return this.find({ 
    patientId,
    'patientAccess.isAccessible': true,
    status: { $in: ['Approved', 'Amended'] }
  })
    .populate('doctorId', 'name specialization')
    .sort({ orderedDate: -1 });
};

TestReportSchema.statics.findPendingReports = function() {
  return this.find({
    status: { $in: ['In Progress', 'Completed'] }
  })
    .populate('patientId', 'name patientId contactNumber')
    .populate('doctorId', 'name')
    .sort({ priority: -1, orderedDate: 1 });
};

TestReportSchema.statics.findCriticalResults = function() {
  return this.find({
    $or: [
      { 'results.flag': 'Critical' },
      { criticalValues: { $exists: true, $ne: [] } }
    ],
    'notifications.criticalValueNotified': false
  })
    .populate('patientId', 'name patientId contactNumber')
    .populate('doctorId', 'name contactNumber');
};

TestReportSchema.statics.findByTestCategory = function(category, startDate, endDate) {
  const query = { testCategory: category };
  
  if (startDate && endDate) {
    query.orderedDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.find(query)
    .populate('patientId', 'name patientId age gender')
    .sort({ orderedDate: -1 });
};

TestReportSchema.statics.getTestStatistics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        orderedDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$testCategory',
        totalTests: { $sum: 1 },
        normalResults: {
          $sum: { $cond: [{ $eq: ['$overallResult', 'Normal'] }, 1, 0] }
        },
        abnormalResults: {
          $sum: { $cond: [{ $eq: ['$overallResult', 'Abnormal'] }, 1, 0] }
        },
        averageTurnaroundTime: {
          $avg: {
            $divide: [
              { $subtract: ['$reportGeneratedDate', '$orderedDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      }
    },
    {
      $sort: { totalTests: -1 }
    }
  ]);
};

export default mongoose.models.TestReport || mongoose.model("TestReport", TestReportSchema);
