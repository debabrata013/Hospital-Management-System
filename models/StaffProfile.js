import mongoose from "mongoose";

const StaffProfileSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },
  
  // Personal Information
  personalInfo: {
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed'],
      default: 'Single'
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    nationality: {
      type: String,
      default: 'Indian'
    },
    religion: String,
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['Basic', 'Intermediate', 'Advanced', 'Native']
      }
    }]
  },
  
  // Identification Documents
  identification: {
    aadharNumber: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^[0-9]{12}$/, 'Please enter a valid Aadhar number']
    },
    panNumber: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
    },
    passportNumber: {
      type: String,
      uppercase: true
    },
    drivingLicense: {
      number: String,
      expiryDate: Date,
      category: [String]
    },
    voterIdNumber: String
  },
  
  // Professional Qualifications
  qualifications: [{
    degree: {
      type: String,
      required: true
    },
    specialization: String,
    institution: {
      type: String,
      required: true
    },
    university: String,
    yearOfPassing: {
      type: Number,
      required: true,
      min: 1950,
      max: new Date().getFullYear()
    },
    grade: String,
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    certificatePath: String,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    verifiedAt: Date
  }],
  
  // Professional Experience
  experience: [{
    organization: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    department: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isCurrent: {
      type: Boolean,
      default: false
    },
    responsibilities: [String],
    achievements: [String],
    reasonForLeaving: String,
    salary: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    contactPerson: {
      name: String,
      designation: String,
      phone: String,
      email: String
    },
    experienceLetter: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Certifications and Licenses
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuingAuthority: {
      type: String,
      required: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: Date,
    certificateNumber: String,
    certificatePath: String,
    isActive: {
      type: Boolean,
      default: true
    },
    renewalRequired: {
      type: Boolean,
      default: false
    },
    renewalDate: Date
  }],
  
  // Skills and Competencies
  skills: [{
    skillName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Technical', 'Clinical', 'Administrative', 'Communication', 'Leadership', 'Other']
    },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    certifiedBy: String,
    certificationDate: Date,
    lastAssessed: Date,
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }],
  
  // Training and Development
  trainings: [{
    trainingName: {
      type: String,
      required: true
    },
    trainingType: {
      type: String,
      enum: ['Orientation', 'Skill Development', 'Safety', 'Compliance', 'Leadership', 'Technical', 'Other']
    },
    provider: String,
    startDate: Date,
    endDate: Date,
    duration: Number, // in hours
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificatePath: String,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String
    }
  }],
  
  // Performance Reviews
  performanceReviews: [{
    reviewPeriod: {
      startDate: Date,
      endDate: Date
    },
    reviewType: {
      type: String,
      enum: ['Annual', 'Mid-Year', 'Probation', 'Project-based', 'Disciplinary']
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    competencyRatings: [{
      competency: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String
    }],
    achievements: [String],
    areasForImprovement: [String],
    goals: [{
      goal: String,
      targetDate: Date,
      status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Not Started'
      }
    }],
    reviewComments: String,
    employeeComments: String,
    actionPlan: String,
    nextReviewDate: Date,
    reviewDocumentPath: String
  }],
  
  // Disciplinary Actions
  disciplinaryActions: [{
    actionType: {
      type: String,
      enum: ['Verbal Warning', 'Written Warning', 'Suspension', 'Termination', 'Counseling'],
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    description: String,
    actionDate: {
      type: Date,
      required: true
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    witnessedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    employeeResponse: String,
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Resolved', 'Appealed', 'Overturned'],
      default: 'Active'
    },
    documentPath: String
  }],
  
  // Health and Medical Information
  healthInfo: {
    medicalConditions: [String],
    allergies: [String],
    medications: [String],
    emergencyMedicalInfo: String,
    lastMedicalCheckup: Date,
    nextMedicalCheckup: Date,
    fitnessForDuty: {
      status: {
        type: String,
        enum: ['Fit', 'Fit with Restrictions', 'Unfit', 'Under Review'],
        default: 'Fit'
      },
      restrictions: [String],
      lastAssessment: Date,
      nextAssessment: Date,
      assessedBy: String
    },
    vaccinations: [{
      vaccineName: String,
      dateAdministered: Date,
      nextDueDate: Date,
      batchNumber: String,
      administeredBy: String
    }]
  },
  
  // Family Information
  familyInfo: {
    spouse: {
      name: String,
      occupation: String,
      phone: String,
      email: String
    },
    children: [{
      name: String,
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ['Male', 'Female']
      },
      education: String
    }],
    parents: [{
      name: String,
      relationship: {
        type: String,
        enum: ['Father', 'Mother', 'Guardian']
      },
      phone: String,
      address: String,
      isDependent: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Benefits and Entitlements
  benefits: {
    healthInsurance: {
      policyNumber: String,
      provider: String,
      coverageAmount: Number,
      familyCovered: {
        type: Boolean,
        default: false
      },
      dependents: [String],
      validFrom: Date,
      validTo: Date
    },
    lifeInsurance: {
      policyNumber: String,
      provider: String,
      coverageAmount: Number,
      nominee: String,
      validFrom: Date,
      validTo: Date
    },
    providentFund: {
      pfNumber: String,
      uanNumber: String,
      contributionPercentage: {
        type: Number,
        default: 12
      },
      nomineeDetails: String
    },
    gratuity: {
      eligible: {
        type: Boolean,
        default: false
      },
      eligibilityDate: Date,
      currentAmount: Number
    },
    leaveEntitlements: {
      annualLeave: {
        type: Number,
        default: 21
      },
      sickLeave: {
        type: Number,
        default: 12
      },
      casualLeave: {
        type: Number,
        default: 12
      },
      maternityLeave: {
        type: Number,
        default: 180
      },
      paternityLeave: {
        type: Number,
        default: 15
      }
    }
  },
  
  // Current Assignment
  currentAssignment: {
    department: String,
    ward: String,
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Rotating', 'Fixed']
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    workLocation: String,
    specialAssignments: [String],
    assignmentDate: Date
  },
  
  // Status and Flags
  employmentStatus: {
    type: String,
    enum: ['Active', 'On Leave', 'Suspended', 'Terminated', 'Resigned', 'Retired'],
    default: 'Active',
    index: true
  },
  probationPeriod: {
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Extended', 'Failed'],
      default: 'In Progress'
    },
    extensionReason: String
  },
  
  // Audit Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // For offline sync
  lastUpdated: { 
    type: Number, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
StaffProfileSchema.index({ userId: 1 });
StaffProfileSchema.index({ employmentStatus: 1 });
StaffProfileSchema.index({ 'personalInfo.dateOfBirth': 1 });
StaffProfileSchema.index({ 'identification.aadharNumber': 1 }, { sparse: true });
StaffProfileSchema.index({ 'identification.panNumber': 1 }, { sparse: true });

// Virtual for age
StaffProfileSchema.virtual('age').get(function() {
  if (this.personalInfo.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.personalInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
});

// Virtual for total experience
StaffProfileSchema.virtual('totalExperience').get(function() {
  let totalMonths = 0;
  
  this.experience.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    
    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    
    totalMonths += (yearDiff * 12) + monthDiff;
  });
  
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  return { years, months, totalMonths };
});

// Virtual for upcoming renewals
StaffProfileSchema.virtual('upcomingRenewals').get(function() {
  const renewals = [];
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  this.certifications.forEach(cert => {
    if (cert.expiryDate && cert.expiryDate <= threeMonthsFromNow && cert.isActive) {
      renewals.push({
        type: 'Certification',
        name: cert.name,
        expiryDate: cert.expiryDate,
        daysRemaining: Math.ceil((cert.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
      });
    }
  });
  
  return renewals;
});

// Pre-save middleware
StaffProfileSchema.pre('save', function(next) {
  // Update probation status based on dates
  if (this.probationPeriod.endDate && this.probationPeriod.status === 'In Progress') {
    const now = new Date();
    if (now > this.probationPeriod.endDate) {
      this.probationPeriod.status = 'Completed';
    }
  }
  
  // Update certification renewal flags
  this.certifications.forEach(cert => {
    if (cert.expiryDate) {
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      
      cert.renewalRequired = cert.expiryDate <= threeMonthsFromNow;
    }
  });
  
  this.lastUpdated = Date.now();
  next();
});

// Instance Methods
StaffProfileSchema.methods.addQualification = function(qualificationData) {
  this.qualifications.push(qualificationData);
  return this.save();
};

StaffProfileSchema.methods.addExperience = function(experienceData) {
  this.experience.push(experienceData);
  return this.save();
};

StaffProfileSchema.methods.addCertification = function(certificationData) {
  this.certifications.push(certificationData);
  return this.save();
};

StaffProfileSchema.methods.addTraining = function(trainingData) {
  this.trainings.push(trainingData);
  return this.save();
};

StaffProfileSchema.methods.addPerformanceReview = function(reviewData, reviewedBy) {
  this.performanceReviews.push({
    ...reviewData,
    reviewedBy: reviewedBy
  });
  return this.save();
};

StaffProfileSchema.methods.addDisciplinaryAction = function(actionData, actionBy) {
  this.disciplinaryActions.push({
    ...actionData,
    actionBy: actionBy,
    actionDate: new Date()
  });
  return this.save();
};

StaffProfileSchema.methods.updateEmploymentStatus = function(status, updatedBy) {
  this.employmentStatus = status;
  this.lastUpdatedBy = updatedBy;
  return this.save();
};

StaffProfileSchema.methods.verifyQualification = function(qualificationIndex, verifiedBy) {
  if (qualificationIndex < this.qualifications.length) {
    this.qualifications[qualificationIndex].verified = true;
    this.qualifications[qualificationIndex].verifiedBy = verifiedBy;
    this.qualifications[qualificationIndex].verifiedAt = new Date();
  }
  return this.save();
};

// Static Methods
StaffProfileSchema.statics.findByDepartment = function(department) {
  return this.find({ 'currentAssignment.department': department })
    .populate('userId', 'name employeeId role email contactNumber')
    .sort({ 'userId.name': 1 });
};

StaffProfileSchema.statics.findByEmploymentStatus = function(status) {
  return this.find({ employmentStatus: status })
    .populate('userId', 'name employeeId role department')
    .sort({ 'userId.name': 1 });
};

StaffProfileSchema.statics.findUpcomingBirthdays = function(days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.find({
    employmentStatus: 'Active'
  })
    .populate('userId', 'name employeeId department')
    .then(profiles => {
      return profiles.filter(profile => {
        if (!profile.personalInfo.dateOfBirth) return false;
        
        const birthday = new Date(profile.personalInfo.dateOfBirth);
        birthday.setFullYear(today.getFullYear());
        
        // If birthday has passed this year, check next year
        if (birthday < today) {
          birthday.setFullYear(today.getFullYear() + 1);
        }
        
        return birthday >= today && birthday <= futureDate;
      });
    });
};

StaffProfileSchema.statics.findExpiringCertifications = function(days = 90) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    employmentStatus: 'Active',
    'certifications.expiryDate': { $lte: futureDate },
    'certifications.isActive': true
  })
    .populate('userId', 'name employeeId department');
};

StaffProfileSchema.statics.getStaffStats = function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: null,
        totalStaff: { $sum: 1 },
        activeStaff: { 
          $sum: { $cond: [{ $eq: ['$employmentStatus', 'Active'] }, 1, 0] }
        },
        onLeaveStaff: { 
          $sum: { $cond: [{ $eq: ['$employmentStatus', 'On Leave'] }, 1, 0] }
        },
        departmentDistribution: { $push: '$user.department' },
        averageAge: { $avg: '$age' },
        genderDistribution: { $push: '$personalInfo.gender' }
      }
    }
  ]);
};

export default mongoose.models.StaffProfile || mongoose.model("StaffProfile", StaffProfileSchema);
