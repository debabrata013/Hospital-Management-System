import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema({
  // Unique Prescription Identifier
  prescriptionId: {
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
    ref: "MedicalRecord",
    index: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  
  // Prescription Details
  prescriptionDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  validUntil: {
    type: Date,
    required: true,
    default: function() {
      const date = new Date();
      date.setMonth(date.getMonth() + 6); // Valid for 6 months
      return date;
    }
  },
  
  // Medications
  medications: [{
    medicineId: String, // Reference to medicine inventory
    medicineName: {
      type: String,
      required: true
    },
    genericName: String,
    strength: String,
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Other']
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true,
      enum: ['Once daily', 'Twice daily', 'Thrice daily', 'Four times daily', 'As needed', 'Before meals', 'After meals', 'At bedtime', 'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours']
    },
    duration: {
      type: String,
      required: true
    },
    route: {
      type: String,
      enum: ['Oral', 'Topical', 'Injection', 'Inhalation', 'Eye drops', 'Ear drops', 'Nasal', 'Rectal', 'Sublingual'],
      default: 'Oral'
    },
    instructions: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    refills: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    substitutionAllowed: {
      type: Boolean,
      default: true
    },
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'STAT'],
      default: 'Routine'
    },
    cost: Number,
    // Dispensing information
    dispensed: {
      quantity: {
        type: Number,
        default: 0
      },
      dates: [Date],
      pharmacist: String,
      remainingRefills: {
        type: Number,
        default: function() { return this.refills; }
      }
    }
  }],
  
  // Clinical Information
  diagnosis: String,
  symptoms: [String],
  allergies: [String],
  
  // Instructions and Advice
  generalInstructions: String,
  dietaryAdvice: String,
  lifestyleRecommendations: String,
  followUpInstructions: String,
  warningSignsToWatch: [String],
  
  // Digital Signature and Authentication
  digitalSignature: {
    doctorSignature: String, // Base64 encoded signature
    signedAt: Date,
    signatureMethod: {
      type: String,
      enum: ['Digital', 'Electronic', 'Biometric'],
      default: 'Digital'
    }
  },
  
  // Prescription Status
  status: {
    type: String,
    enum: ['Active', 'Partially Filled', 'Completed', 'Cancelled', 'Expired'],
    default: 'Active',
    index: true
  },
  
  // Pharmacy Information
  pharmacy: {
    name: String,
    address: String,
    contactNumber: String,
    licenseNumber: String
  },
  
  // Patient Access and Download
  patientAccess: {
    isAccessible: {
      type: Boolean,
      default: true
    },
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
    }]
  },
  
  // Compliance and Monitoring
  compliance: {
    adherenceScore: {
      type: Number,
      min: 0,
      max: 100
    },
    missedDoses: [{
      medicationName: String,
      missedDate: Date,
      reason: String
    }],
    sideEffects: [{
      medicationName: String,
      sideEffect: String,
      severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe']
      },
      reportedDate: Date
    }]
  },
  
  // Insurance and Billing
  insurance: {
    covered: {
      type: Boolean,
      default: false
    },
    provider: String,
    policyNumber: String,
    copayAmount: Number,
    preAuthRequired: Boolean,
    preAuthNumber: String
  },
  
  // Quality and Safety Checks
  safetyChecks: {
    drugInteractions: [{
      medication1: String,
      medication2: String,
      interactionLevel: {
        type: String,
        enum: ['Minor', 'Moderate', 'Major', 'Contraindicated']
      },
      description: String
    }],
    allergyChecks: [{
      medication: String,
      allergen: String,
      severity: String
    }],
    dosageChecks: [{
      medication: String,
      recommendedDose: String,
      prescribedDose: String,
      warning: String
    }]
  },
  
  // Audit and Tracking
  auditTrail: [{
    action: {
      type: String,
      enum: ['Created', 'Modified', 'Viewed', 'Downloaded', 'Dispensed', 'Cancelled']
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
  
  // Notes
  notes: String,
  pharmacistNotes: String,
  
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
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
PrescriptionSchema.index({ patientId: 1, prescriptionDate: -1 });
PrescriptionSchema.index({ doctorId: 1, prescriptionDate: -1 });
PrescriptionSchema.index({ validUntil: 1, status: 1 });
PrescriptionSchema.index({ 'medications.medicineName': 1 });

// Virtuals
PrescriptionSchema.virtual('isExpired').get(function() {
  return new Date() > this.validUntil;
});

PrescriptionSchema.virtual('totalMedications').get(function() {
  return this.medications.length;
});

PrescriptionSchema.virtual('totalCost').get(function() {
  return this.medications.reduce((total, med) => total + (med.cost || 0), 0);
});

// Pre-save middleware
PrescriptionSchema.pre('save', function(next) {
  // Generate prescriptionId if not provided
  if (!this.prescriptionId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.prescriptionId = `RX${timestamp}${random}`;
  }
  
  // Update status based on expiry
  if (this.isExpired && this.status === 'Active') {
    this.status = 'Expired';
  }
  
  // Initialize remaining refills for new medications
  this.medications.forEach(med => {
    if (med.dispensed.remainingRefills === undefined) {
      med.dispensed.remainingRefills = med.refills;
    }
  });
  
  this.lastUpdated = Date.now();
  next();
});

// Instance Methods
PrescriptionSchema.methods.addDownloadRecord = function(userId, ipAddress, userAgent) {
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

PrescriptionSchema.methods.dispenseMedication = function(medicationIndex, quantity, pharmacist) {
  if (this.medications[medicationIndex]) {
    const med = this.medications[medicationIndex];
    med.dispensed.quantity += quantity;
    med.dispensed.dates.push(new Date());
    med.dispensed.pharmacist = pharmacist;
    
    if (med.dispensed.remainingRefills > 0) {
      med.dispensed.remainingRefills -= 1;
    }
    
    // Update prescription status
    const allDispensed = this.medications.every(m => 
      m.dispensed.quantity >= m.quantity && m.dispensed.remainingRefills === 0
    );
    const partiallyDispensed = this.medications.some(m => 
      m.dispensed.quantity > 0 || m.dispensed.remainingRefills < m.refills
    );
    
    if (allDispensed) {
      this.status = 'Completed';
    } else if (partiallyDispensed) {
      this.status = 'Partially Filled';
    }
    
    return this.save();
  }
  return null;
};

PrescriptionSchema.methods.addSideEffect = function(medicationName, sideEffect, severity) {
  this.compliance.sideEffects.push({
    medicationName,
    sideEffect,
    severity,
    reportedDate: new Date()
  });
  return this.save();
};

PrescriptionSchema.methods.recordMissedDose = function(medicationName, reason) {
  this.compliance.missedDoses.push({
    medicationName,
    missedDate: new Date(),
    reason
  });
  return this.save();
};

PrescriptionSchema.methods.addAuditEntry = function(action, userId, details, ipAddress) {
  this.auditTrail.push({
    action,
    performedBy: userId,
    details,
    ipAddress,
    timestamp: new Date()
  });
  return this.save();
};

PrescriptionSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'Cancelled';
  this.addAuditEntry('Cancelled', cancelledBy, reason);
  return this.save();
};

// Static Methods
PrescriptionSchema.statics.findByPatient = function(patientId, limit = 20) {
  return this.find({ patientId })
    .populate('doctorId', 'name specialization')
    .sort({ prescriptionDate: -1 })
    .limit(limit);
};

PrescriptionSchema.statics.findActiveByPatient = function(patientId) {
  return this.find({ 
    patientId,
    status: { $in: ['Active', 'Partially Filled'] },
    validUntil: { $gt: new Date() }
  })
    .populate('doctorId', 'name specialization')
    .sort({ prescriptionDate: -1 });
};

PrescriptionSchema.statics.findExpiredPrescriptions = function() {
  return this.find({
    validUntil: { $lt: new Date() },
    status: { $in: ['Active', 'Partially Filled'] }
  }).populate('patientId', 'name patientId contactNumber');
};

PrescriptionSchema.statics.findByMedication = function(medicationName) {
  return this.find({
    'medications.medicineName': { $regex: medicationName, $options: 'i' }
  }).populate('patientId', 'name patientId age gender');
};

PrescriptionSchema.statics.getPrescriptionStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        prescriptionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalPrescriptions: { $sum: 1 },
        totalMedications: { $sum: { $size: '$medications' } },
        averageMedicationsPerPrescription: { $avg: { $size: '$medications' } },
        statusDistribution: { $push: '$status' }
      }
    }
  ]);
};

export default mongoose.models.Prescription || mongoose.model("Prescription", PrescriptionSchema);
