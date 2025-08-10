import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema({
  // Unique Leave Request Identifier
  leaveRequestId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    index: true
  },
  
  // Staff Reference
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  // Leave Details
  leaveType: {
    type: String,
    enum: [
      'Annual Leave', 'Sick Leave', 'Maternity Leave', 'Paternity Leave', 
      'Emergency Leave', 'Casual Leave', 'Compensatory Leave', 'Study Leave',
      'Bereavement Leave', 'Medical Leave', 'Unpaid Leave', 'Sabbatical'
    ],
    required: true,
    index: true
  },
  
  // Leave Period
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  totalDays: {
    type: Number,
    required: true,
    min: 0.5 // Half day minimum
  },
  
  // Leave Status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'In Progress', 'Completed'],
    default: 'Pending',
    index: true
  },
  
  // Application Details
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  description: {
    type: String,
    maxlength: 1000
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Medium'
  },
  
  // Supporting Documents
  documents: [{
    documentType: {
      type: String,
      enum: ['Medical Certificate', 'Death Certificate', 'Travel Documents', 'Other']
    },
    documentName: String,
    documentPath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Approval Workflow
  approvalWorkflow: [{
    approverLevel: {
      type: String,
      enum: ['Immediate Supervisor', 'Department Head', 'HR Manager', 'Medical Director', 'Administrator'],
      required: true
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    approvedAt: Date,
    comments: String,
    conditions: String // Any conditions attached to approval
  }],
  
  // Leave Coverage
  coverage: {
    isRequired: {
      type: Boolean,
      default: true
    },
    coveringStaff: [{
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      coverageDates: [{
        date: Date,
        shiftType: String,
        confirmed: {
          type: Boolean,
          default: false
        }
      }],
      responsibilities: [String],
      agreedAt: Date
    }],
    handoverNotes: String,
    criticalTasks: [String]
  },
  
  // Leave Balance Impact
  leaveBalance: {
    balanceBeforeLeave: {
      annualLeave: Number,
      sickLeave: Number,
      casualLeave: Number,
      compensatoryLeave: Number
    },
    balanceAfterLeave: {
      annualLeave: Number,
      sickLeave: Number,
      casualLeave: Number,
      compensatoryLeave: Number
    },
    deductedDays: {
      annualLeave: Number,
      sickLeave: Number,
      casualLeave: Number,
      compensatoryLeave: Number,
      unpaidDays: Number
    }
  },
  
  // Financial Impact
  financialImpact: {
    isPaid: {
      type: Boolean,
      default: true
    },
    salaryDeduction: {
      type: Number,
      min: 0,
      default: 0
    },
    allowancesAffected: [{
      allowanceType: String,
      amount: Number,
      action: {
        type: String,
        enum: ['Deduct', 'Maintain', 'Prorate']
      }
    }],
    totalDeduction: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Emergency Contact (for extended leaves)
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String,
    address: String
  },
  
  // Return to Work
  returnToWork: {
    expectedReturnDate: Date,
    actualReturnDate: Date,
    fitnessForDuty: {
      required: {
        type: Boolean,
        default: false
      },
      certificateProvided: {
        type: Boolean,
        default: false
      },
      certificatePath: String,
      clearanceDate: Date,
      clearanceBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },
    returnNotes: String
  },
  
  // Leave Extension
  extensions: [{
    originalEndDate: Date,
    newEndDate: Date,
    additionalDays: Number,
    reason: String,
    requestedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: Date,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  }],
  
  // Cancellation Details
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reason: String,
    refundDetails: {
      salaryRefund: Number,
      allowanceRefund: Number,
      totalRefund: Number
    }
  },
  
  // HR Notes and Comments
  hrNotes: String,
  supervisorNotes: String,
  medicalNotes: String,
  
  // Compliance and Legal
  compliance: {
    legalRequirements: [{
      requirement: String,
      status: {
        type: String,
        enum: ['Met', 'Pending', 'Not Applicable']
      },
      notes: String
    }],
    policyCompliance: {
      policyVersion: String,
      compliant: {
        type: Boolean,
        default: true
      },
      violations: [String]
    }
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
LeaveRequestSchema.index({ staffId: 1, startDate: -1 });
LeaveRequestSchema.index({ leaveType: 1, status: 1 });
LeaveRequestSchema.index({ status: 1, startDate: 1 });
LeaveRequestSchema.index({ 'approvalWorkflow.approverId': 1, 'approvalWorkflow.status': 1 });

// Virtual for leave duration in working days
LeaveRequestSchema.virtual('workingDays').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  let workingDays = 0;
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    // Exclude weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  
  return workingDays;
});

// Virtual for current approval status
LeaveRequestSchema.virtual('currentApprovalStatus').get(function() {
  const pendingApproval = this.approvalWorkflow.find(approval => approval.status === 'Pending');
  if (pendingApproval) {
    return {
      level: pendingApproval.approverLevel,
      approverId: pendingApproval.approverId,
      isPending: true
    };
  }
  
  const rejectedApproval = this.approvalWorkflow.find(approval => approval.status === 'Rejected');
  if (rejectedApproval) {
    return {
      level: rejectedApproval.approverLevel,
      approverId: rejectedApproval.approverId,
      isRejected: true,
      comments: rejectedApproval.comments
    };
  }
  
  return { allApproved: true };
});

// Virtual for leave status summary
LeaveRequestSchema.virtual('leaveStatusSummary').get(function() {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  
  if (this.status === 'Cancelled' || this.status === 'Rejected') {
    return this.status;
  }
  
  if (this.status === 'Approved') {
    if (now < startDate) return 'Approved - Upcoming';
    if (now >= startDate && now <= endDate) return 'In Progress';
    if (now > endDate) return 'Completed';
  }
  
  return this.status;
});

// Pre-save middleware
LeaveRequestSchema.pre('save', function(next) {
  // Generate leaveRequestId if not provided
  if (!this.leaveRequestId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.leaveRequestId = `LR${timestamp}${random}`;
  }
  
  // Calculate total days if not provided
  if (!this.totalDays && this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    this.totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Update status based on approval workflow
  if (this.approvalWorkflow.length > 0) {
    const allApproved = this.approvalWorkflow.every(approval => approval.status === 'Approved');
    const anyRejected = this.approvalWorkflow.some(approval => approval.status === 'Rejected');
    
    if (anyRejected && this.status === 'Pending') {
      this.status = 'Rejected';
    } else if (allApproved && this.status === 'Pending') {
      this.status = 'Approved';
    }
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Instance Methods
LeaveRequestSchema.methods.addApprover = function(approverLevel, approverId) {
  this.approvalWorkflow.push({
    approverLevel,
    approverId,
    status: 'Pending'
  });
  return this.save();
};

LeaveRequestSchema.methods.approve = function(approverId, comments, conditions) {
  const approval = this.approvalWorkflow.find(a => 
    a.approverId.toString() === approverId.toString() && a.status === 'Pending'
  );
  
  if (approval) {
    approval.status = 'Approved';
    approval.approvedAt = new Date();
    approval.comments = comments;
    approval.conditions = conditions;
  }
  
  return this.save();
};

LeaveRequestSchema.methods.reject = function(approverId, comments) {
  const approval = this.approvalWorkflow.find(a => 
    a.approverId.toString() === approverId.toString() && a.status === 'Pending'
  );
  
  if (approval) {
    approval.status = 'Rejected';
    approval.approvedAt = new Date();
    approval.comments = comments;
  }
  
  return this.save();
};

LeaveRequestSchema.methods.addCoverage = function(coverageData) {
  this.coverage.coveringStaff.push({
    staffId: coverageData.staffId,
    coverageDates: coverageData.coverageDates,
    responsibilities: coverageData.responsibilities,
    agreedAt: new Date()
  });
  
  return this.save();
};

LeaveRequestSchema.methods.extendLeave = function(extensionData, requestedBy) {
  this.extensions.push({
    originalEndDate: this.endDate,
    newEndDate: extensionData.newEndDate,
    additionalDays: extensionData.additionalDays,
    reason: extensionData.reason,
    requestedAt: new Date()
  });
  
  // Update the main end date
  this.endDate = extensionData.newEndDate;
  this.totalDays += extensionData.additionalDays;
  
  return this.save();
};

LeaveRequestSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = 'Cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: cancelledBy,
    reason: reason
  };
  
  return this.save();
};

LeaveRequestSchema.methods.markReturn = function(returnData) {
  this.returnToWork.actualReturnDate = returnData.actualReturnDate || new Date();
  this.returnToWork.returnNotes = returnData.returnNotes;
  
  if (returnData.fitnessRequired) {
    this.returnToWork.fitnessForDuty.required = true;
    this.returnToWork.fitnessForDuty.certificateProvided = returnData.certificateProvided;
    this.returnToWork.fitnessForDuty.certificatePath = returnData.certificatePath;
  }
  
  this.status = 'Completed';
  return this.save();
};

// Static Methods
LeaveRequestSchema.statics.findByStaff = function(staffId, startDate, endDate) {
  const query = { staffId };
  
  if (startDate || endDate) {
    query.$or = [
      {
        startDate: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) })
        }
      },
      {
        endDate: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) })
        }
      }
    ];
  }
  
  return this.find(query)
    .populate('staffId', 'name employeeId role department')
    .populate('approvalWorkflow.approverId', 'name role')
    .sort({ startDate: -1 });
};

LeaveRequestSchema.statics.findPendingApprovals = function(approverId) {
  return this.find({
    'approvalWorkflow.approverId': approverId,
    'approvalWorkflow.status': 'Pending',
    status: 'Pending'
  })
    .populate('staffId', 'name employeeId role department')
    .sort({ createdAt: 1 });
};

LeaveRequestSchema.statics.findActiveLeaves = function(date) {
  const queryDate = date ? new Date(date) : new Date();
  
  return this.find({
    status: { $in: ['Approved', 'In Progress'] },
    startDate: { $lte: queryDate },
    endDate: { $gte: queryDate }
  })
    .populate('staffId', 'name employeeId role department')
    .sort({ startDate: 1 });
};

LeaveRequestSchema.statics.getLeaveStats = function(startDate, endDate, department) {
  const matchQuery = {};
  
  if (startDate || endDate) {
    matchQuery.$or = [
      {
        startDate: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) })
        }
      }
    ];
  }
  
  const pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'staffId',
        foreignField: '_id',
        as: 'staff'
      }
    },
    { $unwind: '$staff' }
  ];
  
  if (department) {
    pipeline.push({ $match: { 'staff.department': department } });
  }
  
  if (Object.keys(matchQuery).length > 0) {
    pipeline.push({ $match: matchQuery });
  }
  
  pipeline.push({
    $group: {
      _id: null,
      totalRequests: { $sum: 1 },
      approvedRequests: { 
        $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
      },
      rejectedRequests: { 
        $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
      },
      pendingRequests: { 
        $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
      },
      totalLeaveDays: { $sum: '$totalDays' },
      averageLeaveDays: { $avg: '$totalDays' },
      leaveTypeDistribution: { $push: '$leaveType' }
    }
  });
  
  return this.aggregate(pipeline);
};

LeaveRequestSchema.statics.getStaffLeaveBalance = function(staffId, year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        staffId: new mongoose.Types.ObjectId(staffId),
        status: { $in: ['Approved', 'Completed'] },
        startDate: { $gte: startOfYear, $lte: endOfYear }
      }
    },
    {
      $group: {
        _id: '$leaveType',
        totalDays: { $sum: '$totalDays' },
        requestCount: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", LeaveRequestSchema);
