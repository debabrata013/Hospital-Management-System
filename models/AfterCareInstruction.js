import mongoose from "mongoose";

const AfterCareInstructionSchema = new mongoose.Schema({
  // Unique Instruction Identifier
  instructionId: {
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
    required: true
  },
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord"
  },
  dischargeSummaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DischargeSummary"
  },
  
  // Instruction Details
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['Post-Surgery', 'Medication', 'Diet', 'Exercise', 'Wound Care', 'Follow-up', 'Lifestyle', 'Emergency', 'General'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Instruction Content
  instructions: {
    overview: {
      type: String,
      required: true
    },
    detailedSteps: [{
      stepNumber: Number,
      instruction: String,
      duration: String,
      frequency: String,
      notes: String
    }],
    dosList: [String],
    dontsList: [String],
    warningSignsToWatch: [String],
    emergencyInstructions: String
  },
  
  // Medication-specific Instructions
  medicationInstructions: [{
    medicineName: String,
    dosage: String,
    timing: String,
    withFood: {
      type: String,
      enum: ['Before meals', 'After meals', 'With meals', 'Empty stomach', 'Anytime']
    },
    specialInstructions: String,
    sideEffectsToWatch: [String],
    interactions: [String]
  }],
  
  // Diet Instructions
  dietInstructions: {
    allowedFoods: [String],
    forbiddenFoods: [String],
    mealTiming: String,
    fluidIntake: String,
    specialDiet: String,
    nutritionalSupplements: [String],
    cookingMethods: [String]
  },
  
  // Exercise and Activity Instructions
  activityInstructions: {
    allowedActivities: [String],
    restrictedActivities: [String],
    exerciseRoutine: String,
    restPeriods: String,
    gradualIncrease: String,
    physicalTherapy: String
  },
  
  // Wound Care Instructions
  woundCareInstructions: {
    cleaningInstructions: String,
    dressingChanges: {
      frequency: String,
      materials: [String],
      technique: String
    },
    signsOfInfection: [String],
    bathingRestrictions: String,
    healingTimeline: String
  },
  
  // Follow-up Instructions
  followUpInstructions: {
    nextAppointment: {
      date: Date,
      doctorName: String,
      purpose: String,
      preparation: String
    },
    testsRequired: [{
      testName: String,
      timeframe: String,
      preparation: String,
      importance: String
    }],
    monitoringParameters: [{
      parameter: String,
      frequency: String,
      normalRange: String,
      actionRequired: String
    }]
  },
  
  // Emergency Instructions
  emergencyInstructions: {
    emergencyContacts: [{
      name: String,
      relationship: String,
      phone: String,
      availability: String
    }],
    hospitalContacts: [{
      department: String,
      phone: String,
      availability: String
    }],
    whenToSeekHelp: [String],
    emergencySymptoms: [String],
    firstAidInstructions: String
  },
  
  // Multimedia Content
  attachments: [{
    type: {
      type: String,
      enum: ['Image', 'Video', 'PDF', 'Audio', 'Document']
    },
    title: String,
    description: String,
    url: String,
    filename: String,
    fileSize: Number,
    duration: String, // for video/audio
    language: {
      type: String,
      enum: ['English', 'Hindi', 'Both'],
      default: 'English'
    }
  }],
  
  // Validity and Timeline
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  estimatedDuration: String, // e.g., "2 weeks", "1 month"
  
  // Patient Interaction
  patientInteraction: {
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedAt: Date,
    questionsAsked: [{
      question: String,
      askedAt: Date,
      answered: Boolean,
      answer: String,
      answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      answeredAt: Date
    }],
    complianceReports: [{
      reportDate: Date,
      complianceScore: {
        type: Number,
        min: 0,
        max: 100
      },
      notes: String,
      reportedBy: String // 'patient' or 'caregiver'
    }]
  },
  
  // Reminders and Notifications
  reminders: [{
    type: {
      type: String,
      enum: ['Medication', 'Appointment', 'Test', 'Activity', 'General']
    },
    message: String,
    scheduledTime: Date,
    frequency: {
      type: String,
      enum: ['Once', 'Daily', 'Weekly', 'Monthly', 'Custom']
    },
    customFrequency: String,
    isActive: {
      type: Boolean,
      default: true
    },
    deliveryMethod: {
      type: String,
      enum: ['SMS', 'Email', 'Push', 'All'],
      default: 'All'
    }
  }],
  
  // Caregiver Instructions
  caregiverInstructions: {
    roleDescription: String,
    specificTasks: [String],
    observationPoints: [String],
    reportingRequirements: String,
    emergencyActions: String,
    supportResources: [String]
  },
  
  // Language and Accessibility
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Both'],
    default: 'English'
  },
  accessibility: {
    largeText: {
      type: Boolean,
      default: false
    },
    audioVersion: {
      type: Boolean,
      default: false
    },
    videoVersion: {
      type: Boolean,
      default: false
    },
    simplifiedVersion: {
      type: Boolean,
      default: false
    }
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Completed', 'Expired', 'Cancelled'],
    default: 'Active',
    index: true
  },
  
  // Patient Access
  patientAccess: {
    isAccessible: {
      type: Boolean,
      default: true
    },
    viewCount: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloaded: Date
  },
  
  // Quality and Effectiveness
  effectiveness: {
    patientSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    clarityRating: {
      type: Number,
      min: 1,
      max: 5
    },
    usefulness: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    improvementSuggestions: String
  },
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['Created', 'Updated', 'Viewed', 'Downloaded', 'Acknowledged', 'Completed']
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
  internalNotes: String,
  
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
AfterCareInstructionSchema.index({ patientId: 1, createdAt: -1 });
AfterCareInstructionSchema.index({ category: 1, status: 1 });
AfterCareInstructionSchema.index({ validUntil: 1 });

// Virtuals
AfterCareInstructionSchema.virtual('isExpired').get(function() {
  return this.validUntil && new Date() > this.validUntil;
});

AfterCareInstructionSchema.virtual('hasActiveReminders').get(function() {
  return this.reminders.some(reminder => reminder.isActive);
});

AfterCareInstructionSchema.virtual('totalSteps').get(function() {
  return this.instructions.detailedSteps.length;
});

// Pre-save middleware
AfterCareInstructionSchema.pre('save', function(next) {
  // Generate instructionId if not provided
  if (!this.instructionId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.instructionId = `AC${timestamp}${random}`;
  }
  
  // Update status based on expiry
  if (this.isExpired && this.status === 'Active') {
    this.status = 'Expired';
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Instance Methods
AfterCareInstructionSchema.methods.acknowledge = function(patientId) {
  this.patientInteraction.acknowledged = true;
  this.patientInteraction.acknowledgedAt = new Date();
  this.addAuditEntry('Acknowledged', patientId, 'Patient acknowledged instructions');
  return this.save();
};

AfterCareInstructionSchema.methods.addQuestion = function(question, patientId) {
  this.patientInteraction.questionsAsked.push({
    question,
    askedAt: new Date()
  });
  return this.save();
};

AfterCareInstructionSchema.methods.answerQuestion = function(questionIndex, answer, answeredBy) {
  if (this.patientInteraction.questionsAsked[questionIndex]) {
    const question = this.patientInteraction.questionsAsked[questionIndex];
    question.answered = true;
    question.answer = answer;
    question.answeredBy = answeredBy;
    question.answeredAt = new Date();
    return this.save();
  }
  return null;
};

AfterCareInstructionSchema.methods.addComplianceReport = function(complianceData) {
  this.patientInteraction.complianceReports.push({
    ...complianceData,
    reportDate: new Date()
  });
  return this.save();
};

AfterCareInstructionSchema.methods.addReminder = function(reminderData) {
  this.reminders.push(reminderData);
  return this.save();
};

AfterCareInstructionSchema.methods.deactivateReminder = function(reminderIndex) {
  if (this.reminders[reminderIndex]) {
    this.reminders[reminderIndex].isActive = false;
    return this.save();
  }
  return null;
};

AfterCareInstructionSchema.methods.recordView = function() {
  this.patientAccess.viewCount += 1;
  this.patientAccess.lastViewed = new Date();
  return this.save();
};

AfterCareInstructionSchema.methods.recordDownload = function() {
  this.patientAccess.downloadCount += 1;
  this.patientAccess.lastDownloaded = new Date();
  return this.save();
};

AfterCareInstructionSchema.methods.addFeedback = function(feedbackData) {
  this.effectiveness = {
    ...this.effectiveness,
    ...feedbackData
  };
  return this.save();
};

AfterCareInstructionSchema.methods.addAuditEntry = function(action, userId, details, ipAddress) {
  this.auditTrail.push({
    action,
    performedBy: userId,
    details,
    ipAddress,
    timestamp: new Date()
  });
  return this.save();
};

AfterCareInstructionSchema.methods.complete = function(completedBy) {
  this.status = 'Completed';
  this.addAuditEntry('Completed', completedBy, 'Instructions marked as completed');
  return this.save();
};

// Static Methods
AfterCareInstructionSchema.statics.findByPatient = function(patientId, status = null) {
  const query = { patientId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('doctorId', 'name specialization')
    .sort({ createdAt: -1 });
};

AfterCareInstructionSchema.statics.findActiveByPatient = function(patientId) {
  return this.find({ 
    patientId,
    status: 'Active',
    $or: [
      { validUntil: { $exists: false } },
      { validUntil: { $gt: new Date() } }
    ]
  })
    .populate('doctorId', 'name specialization')
    .sort({ priority: -1, createdAt: -1 });
};

AfterCareInstructionSchema.statics.findByCategory = function(category, patientId = null) {
  const query = { category, status: 'Active' };
  if (patientId) {
    query.patientId = patientId;
  }
  
  return this.find(query)
    .populate('patientId', 'name patientId')
    .populate('doctorId', 'name specialization')
    .sort({ createdAt: -1 });
};

AfterCareInstructionSchema.statics.findExpiredInstructions = function() {
  return this.find({
    validUntil: { $lt: new Date() },
    status: 'Active'
  }).populate('patientId', 'name patientId contactNumber');
};

AfterCareInstructionSchema.statics.findPendingAcknowledgment = function() {
  return this.find({
    status: 'Active',
    'patientInteraction.acknowledged': false
  })
    .populate('patientId', 'name patientId contactNumber')
    .sort({ createdAt: -1 });
};

AfterCareInstructionSchema.statics.getInstructionStatistics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$category',
        totalInstructions: { $sum: 1 },
        acknowledgedCount: {
          $sum: { $cond: ['$patientInteraction.acknowledged', 1, 0] }
        },
        averageViewCount: { $avg: '$patientAccess.viewCount' },
        averageSatisfaction: { $avg: '$effectiveness.patientSatisfaction' }
      }
    },
    {
      $sort: { totalInstructions: -1 }
    }
  ]);
};

export default mongoose.models.AfterCareInstruction || mongoose.model("AfterCareInstruction", AfterCareInstructionSchema);
