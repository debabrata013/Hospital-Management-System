import mongoose from "mongoose";

const DischargeSummarySchema = new mongoose.Schema({
  // Unique Summary Identifier
  summaryId: {
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
  admissionId: {
    type: String,
    required: true,
    index: true
  },
  primaryDoctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  consultingDoctors: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    specialization: String,
    role: {
      type: String,
      enum: ['Primary', 'Consulting', 'Specialist']
    }
  }],
  
  // Admission Details
  admissionInfo: {
    admissionDate: {
      type: Date,
      required: true
    },
    dischargeDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    lengthOfStay: {
      type: Number, // in days
      required: true
    },
    admissionType: {
      type: String,
      enum: ['Emergency', 'Elective', 'Transfer', 'Observation'],
      required: true
    },
    dischargeType: {
      type: String,
      enum: ['Home', 'Transfer', 'AMA', 'Expired', 'LAMA', 'Absconded'],
      required: true
    },
    roomDetails: {
      roomNumber: String,
      roomType: {
        type: String,
        enum: ['General Ward', 'Private Room', 'ICU', 'CCU', 'Emergency']
      },
      bedNumber: String
    }
  },
  
  // Clinical Information
  clinicalDetails: {
    chiefComplaint: {
      type: String,
      required: true
    },
    historyOfPresentIllness: String,
    pastMedicalHistory: String,
    familyHistory: String,
    socialHistory: String,
    allergies: [String],
    
    // Physical Examination on Admission
    admissionExamination: {
      generalCondition: String,
      vitalSigns: {
        bloodPressure: String,
        pulse: String,
        temperature: String,
        respiratoryRate: String,
        oxygenSaturation: String,
        weight: String,
        height: String
      },
      systemicExamination: String
    },
    
    // Physical Examination on Discharge
    dischargeExamination: {
      generalCondition: String,
      vitalSigns: {
        bloodPressure: String,
        pulse: String,
        temperature: String,
        respiratoryRate: String,
        oxygenSaturation: String,
        weight: String
      },
      systemicExamination: String
    }
  },
  
  // Diagnosis
  diagnosis: {
    primaryDiagnosis: {
      condition: {
        type: String,
        required: true
      },
      icdCode: String
    },
    secondaryDiagnosis: [{
      condition: String,
      icdCode: String
    }],
    comorbidities: [String],
    complications: [String]
  },
  
  // Investigations and Results
  investigations: {
    laboratoryTests: [{
      testName: String,
      date: Date,
      results: String,
      normalRange: String,
      significance: String
    }],
    radiologyTests: [{
      testName: String,
      date: Date,
      findings: String,
      impression: String
    }],
    specialInvestigations: [{
      testName: String,
      date: Date,
      results: String,
      interpretation: String
    }]
  },
  
  // Treatment Given
  treatmentDetails: {
    // Medications during stay
    medicationsDuringStay: [{
      medicineName: String,
      dosage: String,
      frequency: String,
      duration: String,
      indication: String
    }],
    
    // Procedures performed
    procedures: [{
      procedureName: String,
      date: Date,
      performedBy: String,
      indication: String,
      outcome: String,
      complications: String
    }],
    
    // Surgeries
    surgeries: [{
      surgeryName: String,
      date: Date,
      surgeon: String,
      anesthesia: String,
      duration: String,
      findings: String,
      complications: String
    }],
    
    // Other treatments
    otherTreatments: [{
      treatment: String,
      duration: String,
      response: String
    }]
  },
  
  // Hospital Course
  hospitalCourse: {
    dailyProgress: [{
      date: Date,
      notes: String,
      vitals: String,
      treatment: String,
      response: String
    }],
    significantEvents: [{
      date: Date,
      event: String,
      action: String,
      outcome: String
    }],
    overallProgress: String,
    responseToTreatment: String
  },
  
  // Discharge Medications
  dischargeMedications: [{
    medicineName: {
      type: String,
      required: true
    },
    genericName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    indication: String,
    quantity: Number,
    refills: Number
  }],
  
  // Discharge Instructions
  dischargeInstructions: {
    // Activity restrictions
    activityRestrictions: String,
    
    // Diet instructions
    dietInstructions: String,
    
    // Wound care
    woundCare: String,
    
    // General care instructions
    generalInstructions: String,
    
    // Warning signs to watch for
    warningSignsToWatch: [String],
    
    // When to seek immediate medical attention
    emergencyInstructions: String,
    
    // Lifestyle modifications
    lifestyleModifications: String
  },
  
  // Follow-up Care
  followUpCare: {
    followUpAppointments: [{
      doctorName: String,
      specialization: String,
      appointmentDate: Date,
      reason: String,
      contactNumber: String
    }],
    
    // Tests to be done
    followUpTests: [{
      testName: String,
      timeframe: String,
      reason: String
    }],
    
    // Referrals
    referrals: [{
      specialistType: String,
      doctorName: String,
      hospital: String,
      reason: String,
      urgency: String,
      contactDetails: String
    }]
  },
  
  // Condition on Discharge
  conditionOnDischarge: {
    type: String,
    enum: ['Improved', 'Stable', 'Same', 'Worse', 'Critical'],
    required: true
  },
  
  // Prognosis
  prognosis: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Guarded', 'Poor'],
    required: true
  },
  
  // Billing Summary
  billingSummary: {
    totalBillAmount: Number,
    insuranceCovered: Number,
    patientPayable: Number,
    advancePaid: Number,
    balanceAmount: Number,
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing"
    }
  },
  
  // Digital Signatures
  signatures: {
    primaryDoctor: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      signature: String, // Base64 encoded
      signedAt: Date
    },
    consultingDoctors: [{
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      signature: String,
      signedAt: Date
    }],
    medicalSuperintendent: {
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      signature: String,
      signedAt: Date
    }
  },
  
  // Patient Access Control
  patientAccess: {
    isAccessible: {
      type: Boolean,
      default: true
    },
    accessGrantedDate: {
      type: Date,
      default: Date.now
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
  
  // Quality Metrics
  qualityMetrics: {
    completenessScore: {
      type: Number,
      min: 0,
      max: 100
    },
    readmissionRisk: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    patientSatisfactionScore: Number
  },
  
  // Attachments
  attachments: [{
    type: {
      type: String,
      enum: ['Lab Report', 'Radiology Report', 'Procedure Note', 'Consent Form', 'Other']
    },
    filename: String,
    url: String,
    uploadedDate: Date,
    description: String
  }],
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['Draft', 'Completed', 'Reviewed', 'Approved', 'Amended'],
    default: 'Draft',
    index: true
  },
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['Created', 'Updated', 'Reviewed', 'Approved', 'Downloaded', 'Shared']
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
  internalNotes: String, // Not visible to patient
  
  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
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
DischargeSummarySchema.index({ patientId: 1, 'admissionInfo.dischargeDate': -1 });
DischargeSummarySchema.index({ admissionId: 1 });
DischargeSummarySchema.index({ primaryDoctorId: 1 });
DischargeSummarySchema.index({ status: 1 });

// Virtuals
DischargeSummarySchema.virtual('totalMedications').get(function() {
  return this.dischargeMedications.length;
});

DischargeSummarySchema.virtual('hasFollowUp').get(function() {
  return this.followUpCare.followUpAppointments.length > 0 ||
         this.followUpCare.followUpTests.length > 0 ||
         this.followUpCare.referrals.length > 0;
});

// Pre-save middleware
DischargeSummarySchema.pre('save', function(next) {
  // Generate summaryId if not provided
  if (!this.summaryId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.summaryId = `DS${timestamp}${random}`;
  }
  
  // Calculate length of stay
  if (this.admissionInfo.admissionDate && this.admissionInfo.dischargeDate) {
    const diffTime = Math.abs(this.admissionInfo.dischargeDate - this.admissionInfo.admissionDate);
    this.admissionInfo.lengthOfStay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Calculate completeness score
  this.qualityMetrics = this.qualityMetrics || {};
  this.qualityMetrics.completenessScore = this.calculateCompletenessScore();
  
  this.lastUpdated = Date.now();
  next();
});

// Instance Methods
DischargeSummarySchema.methods.calculateCompletenessScore = function() {
  let score = 0;
  const maxScore = 100;
  
  // Basic information (20 points)
  if (this.clinicalDetails.chiefComplaint) score += 5;
  if (this.diagnosis.primaryDiagnosis.condition) score += 10;
  if (this.conditionOnDischarge) score += 5;
  
  // Treatment details (20 points)
  if (this.treatmentDetails.medicationsDuringStay.length > 0) score += 10;
  if (this.hospitalCourse.overallProgress) score += 10;
  
  // Discharge information (30 points)
  if (this.dischargeMedications.length > 0) score += 10;
  if (this.dischargeInstructions.generalInstructions) score += 10;
  if (this.dischargeInstructions.warningSignsToWatch.length > 0) score += 10;
  
  // Follow-up care (20 points)
  if (this.followUpCare.followUpAppointments.length > 0) score += 10;
  if (this.followUpCare.followUpTests.length > 0) score += 5;
  if (this.followUpCare.referrals.length > 0) score += 5;
  
  // Documentation (10 points)
  if (this.signatures.primaryDoctor.signature) score += 5;
  if (this.status === 'Approved') score += 5;
  
  return Math.min(score, maxScore);
};

DischargeSummarySchema.methods.addDownloadRecord = function(userId, ipAddress, userAgent) {
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

DischargeSummarySchema.methods.addSignature = function(doctorId, signatureData, role = 'primary') {
  const signatureEntry = {
    doctorId,
    signature: signatureData,
    signedAt: new Date()
  };
  
  if (role === 'primary') {
    this.signatures.primaryDoctor = signatureEntry;
  } else if (role === 'consulting') {
    this.signatures.consultingDoctors.push(signatureEntry);
  } else if (role === 'superintendent') {
    this.signatures.medicalSuperintendent = signatureEntry;
  }
  
  return this.save();
};

DischargeSummarySchema.methods.addAuditEntry = function(action, userId, details, ipAddress) {
  this.auditTrail.push({
    action,
    performedBy: userId,
    details,
    ipAddress,
    timestamp: new Date()
  });
  return this.save();
};

DischargeSummarySchema.methods.approve = function(approvedBy) {
  this.status = 'Approved';
  this.addAuditEntry('Approved', approvedBy, 'Discharge summary approved');
  return this.save();
};

DischargeSummarySchema.methods.addFollowUpAppointment = function(appointmentData) {
  this.followUpCare.followUpAppointments.push(appointmentData);
  return this.save();
};

DischargeSummarySchema.methods.addDischargeMedication = function(medicationData) {
  this.dischargeMedications.push(medicationData);
  return this.save();
};

// Static Methods
DischargeSummarySchema.statics.findByPatient = function(patientId, limit = 10) {
  return this.find({ patientId })
    .populate('primaryDoctorId', 'name specialization')
    .populate('consultingDoctors.doctorId', 'name specialization')
    .sort({ 'admissionInfo.dischargeDate': -1 })
    .limit(limit);
};

DischargeSummarySchema.statics.findPatientAccessible = function(patientId) {
  return this.find({ 
    patientId,
    'patientAccess.isAccessible': true,
    status: { $in: ['Approved', 'Completed'] }
  })
    .populate('primaryDoctorId', 'name specialization')
    .sort({ 'admissionInfo.dischargeDate': -1 });
};

DischargeSummarySchema.statics.findByAdmissionId = function(admissionId) {
  return this.findOne({ admissionId })
    .populate('primaryDoctorId', 'name specialization')
    .populate('consultingDoctors.doctorId', 'name specialization');
};

DischargeSummarySchema.statics.findPendingApproval = function() {
  return this.find({ status: { $in: ['Draft', 'Completed'] } })
    .populate('patientId', 'name patientId')
    .populate('primaryDoctorId', 'name')
    .sort({ 'admissionInfo.dischargeDate': -1 });
};

DischargeSummarySchema.statics.getDischargeStatistics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        'admissionInfo.dischargeDate': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$conditionOnDischarge',
        count: { $sum: 1 },
        averageLengthOfStay: { $avg: '$admissionInfo.lengthOfStay' },
        averageCompletenessScore: { $avg: '$qualityMetrics.completenessScore' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export default mongoose.models.DischargeSummary || mongoose.model("DischargeSummary", DischargeSummarySchema);
