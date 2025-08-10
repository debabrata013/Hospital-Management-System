import mongoose from "mongoose";

const StaffShiftSchema = new mongoose.Schema({
  // Unique Shift Identifier
  shiftId: {
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
  
  // Shift Details
  shiftDate: {
    type: Date,
    required: true,
    index: true
  },
  shiftType: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'Full Day', 'Emergency', 'On-Call'],
    required: true,
    index: true
  },
  
  // Time Schedule
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  breakTime: {
    start: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    end: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    duration: {
      type: Number,
      min: 0,
      max: 120, // Maximum 2 hours break
      default: 30 // 30 minutes default
    }
  },
  
  // Location and Assignment
  department: {
    type: String,
    required: true,
    index: true
  },
  ward: String,
  room: String,
  floor: String,
  
  // Shift Status
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Emergency'],
    default: 'Scheduled',
    index: true
  },
  
  // Attendance Tracking
  attendance: {
    checkIn: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number
      },
      method: {
        type: String,
        enum: ['Manual', 'Biometric', 'RFID', 'Mobile App', 'QR Code'],
        default: 'Manual'
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },
    checkOut: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number
      },
      method: {
        type: String,
        enum: ['Manual', 'Biometric', 'RFID', 'Mobile App', 'QR Code'],
        default: 'Manual'
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },
    breakTaken: [{
      startTime: Date,
      endTime: Date,
      duration: Number, // in minutes
      reason: String
    }],
    totalHours: {
      type: Number,
      min: 0
    },
    overtimeHours: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Shift Responsibilities
  responsibilities: [{
    task: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    completedAt: Date,
    notes: String
  }],
  
  // Doctor-specific fields
  doctorSchedule: {
    consultationSlots: [{
      startTime: String,
      endTime: String,
      patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
      },
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
      },
      status: {
        type: String,
        enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
        default: 'Scheduled'
      }
    }],
    maxPatients: {
      type: Number,
      min: 1,
      max: 50,
      default: 20
    },
    consultationFee: Number,
    emergencyAvailable: {
      type: Boolean,
      default: false
    }
  },
  
  // Shift Handover
  handover: {
    from: {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      notes: String,
      handoverTime: Date,
      criticalPatients: [{
        patientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Patient"
        },
        condition: String,
        instructions: String,
        priority: {
          type: String,
          enum: ['Low', 'Medium', 'High', 'Critical']
        }
      }],
      pendingTasks: [String],
      equipmentStatus: String
    },
    to: {
      staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      acknowledgedAt: Date,
      notes: String
    }
  },
  
  // Performance Metrics
  performance: {
    punctuality: {
      type: String,
      enum: ['Excellent', 'Good', 'Average', 'Poor'],
      default: 'Good'
    },
    productivity: {
      tasksCompleted: {
        type: Number,
        default: 0
      },
      tasksAssigned: {
        type: Number,
        default: 0
      },
      completionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      }
    },
    patientFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: [String]
    }
  },
  
  // Shift Replacement/Coverage
  replacement: {
    isReplacement: {
      type: Boolean,
      default: false
    },
    originalStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reason: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: Date
  },
  
  // Emergency and Special Conditions
  emergency: {
    isEmergencyShift: {
      type: Boolean,
      default: false
    },
    emergencyType: {
      type: String,
      enum: ['Medical Emergency', 'Staff Shortage', 'Equipment Failure', 'Natural Disaster', 'Other']
    },
    emergencyNotes: String,
    additionalCompensation: {
      type: Number,
      min: 0
    }
  },
  
  // Notes and Comments
  notes: String,
  supervisorNotes: String,
  
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
StaffShiftSchema.index({ staffId: 1, shiftDate: -1 });
StaffShiftSchema.index({ department: 1, shiftDate: -1 });
StaffShiftSchema.index({ shiftType: 1, status: 1 });
StaffShiftSchema.index({ 'attendance.checkIn.time': 1 });
StaffShiftSchema.index({ 'attendance.checkOut.time': 1 });

// Virtual for shift duration in hours
StaffShiftSchema.virtual('shiftDuration').get(function() {
  const start = new Date(`2000-01-01 ${this.startTime}`);
  const end = new Date(`2000-01-01 ${this.endTime}`);
  
  // Handle overnight shifts
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  return (end - start) / (1000 * 60 * 60); // Convert to hours
});

// Virtual for actual hours worked
StaffShiftSchema.virtual('actualHoursWorked').get(function() {
  if (this.attendance.checkIn.time && this.attendance.checkOut.time) {
    const checkIn = new Date(this.attendance.checkIn.time);
    const checkOut = new Date(this.attendance.checkOut.time);
    const totalMinutes = (checkOut - checkIn) / (1000 * 60);
    
    // Subtract break time
    const breakMinutes = this.attendance.breakTaken.reduce((total, breakItem) => {
      return total + (breakItem.duration || 0);
    }, 0);
    
    return Math.max(0, (totalMinutes - breakMinutes) / 60); // Convert to hours
  }
  return 0;
});

// Virtual for shift status summary
StaffShiftSchema.virtual('shiftSummary').get(function() {
  const now = new Date();
  const shiftDateTime = new Date(this.shiftDate);
  const [startHour, startMinute] = this.startTime.split(':').map(Number);
  const [endHour, endMinute] = this.endTime.split(':').map(Number);
  
  shiftDateTime.setHours(startHour, startMinute, 0, 0);
  const endDateTime = new Date(shiftDateTime);
  endDateTime.setHours(endHour, endMinute, 0, 0);
  
  if (endDateTime < shiftDateTime) {
    endDateTime.setDate(endDateTime.getDate() + 1);
  }
  
  if (this.status === 'Completed') return 'Completed';
  if (this.status === 'Cancelled') return 'Cancelled';
  if (now < shiftDateTime) return 'Upcoming';
  if (now >= shiftDateTime && now <= endDateTime) return 'In Progress';
  if (now > endDateTime && this.status === 'Scheduled') return 'Overdue';
  
  return this.status;
});

// Pre-save middleware
StaffShiftSchema.pre('save', function(next) {
  // Generate shiftId if not provided
  if (!this.shiftId) {
    const date = new Date(this.shiftDate);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.shiftId = `SHF${dateStr}${random}`;
  }
  
  // Calculate total hours if attendance is complete
  if (this.attendance.checkIn.time && this.attendance.checkOut.time) {
    this.attendance.totalHours = this.actualHoursWorked;
    
    // Calculate overtime (if worked more than scheduled shift duration)
    const scheduledHours = this.shiftDuration;
    this.attendance.overtimeHours = Math.max(0, this.attendance.totalHours - scheduledHours);
  }
  
  // Update performance completion rate
  if (this.performance.productivity.tasksAssigned > 0) {
    this.performance.productivity.completionRate = 
      (this.performance.productivity.tasksCompleted / this.performance.productivity.tasksAssigned) * 100;
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Instance Methods
StaffShiftSchema.methods.checkIn = function(checkInData, userId) {
  this.attendance.checkIn = {
    time: new Date(),
    location: checkInData.location,
    method: checkInData.method || 'Manual',
    verifiedBy: userId
  };
  
  if (this.status === 'Scheduled') {
    this.status = 'In Progress';
  }
  
  return this.save();
};

StaffShiftSchema.methods.checkOut = function(checkOutData, userId) {
  this.attendance.checkOut = {
    time: new Date(),
    location: checkOutData.location,
    method: checkOutData.method || 'Manual',
    verifiedBy: userId
  };
  
  this.status = 'Completed';
  return this.save();
};

StaffShiftSchema.methods.addBreak = function(breakData) {
  this.attendance.breakTaken.push({
    startTime: breakData.startTime || new Date(),
    endTime: breakData.endTime,
    duration: breakData.duration,
    reason: breakData.reason
  });
  
  return this.save();
};

StaffShiftSchema.methods.assignTask = function(taskData, assignedBy) {
  this.responsibilities.push({
    task: taskData.task,
    priority: taskData.priority || 'Medium',
    assignedBy: assignedBy,
    status: 'Pending'
  });
  
  this.performance.productivity.tasksAssigned += 1;
  return this.save();
};

StaffShiftSchema.methods.completeTask = function(taskIndex, notes) {
  if (taskIndex < this.responsibilities.length) {
    this.responsibilities[taskIndex].status = 'Completed';
    this.responsibilities[taskIndex].completedAt = new Date();
    this.responsibilities[taskIndex].notes = notes;
    
    this.performance.productivity.tasksCompleted += 1;
  }
  
  return this.save();
};

StaffShiftSchema.methods.addHandover = function(handoverData, fromStaffId) {
  this.handover.from = {
    staffId: fromStaffId,
    notes: handoverData.notes,
    handoverTime: new Date(),
    criticalPatients: handoverData.criticalPatients || [],
    pendingTasks: handoverData.pendingTasks || [],
    equipmentStatus: handoverData.equipmentStatus
  };
  
  return this.save();
};

StaffShiftSchema.methods.acknowledgeHandover = function(toStaffId, notes) {
  this.handover.to = {
    staffId: toStaffId,
    acknowledgedAt: new Date(),
    notes: notes
  };
  
  return this.save();
};

// Static Methods
StaffShiftSchema.statics.findShiftsByStaff = function(staffId, startDate, endDate) {
  const query = { staffId };
  
  if (startDate || endDate) {
    query.shiftDate = {};
    if (startDate) query.shiftDate.$gte = new Date(startDate);
    if (endDate) query.shiftDate.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .populate('staffId', 'name employeeId role department')
    .sort({ shiftDate: -1 });
};

StaffShiftSchema.statics.findShiftsByDepartment = function(department, date) {
  const query = { department };
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    query.shiftDate = { $gte: startOfDay, $lte: endOfDay };
  }
  
  return this.find(query)
    .populate('staffId', 'name employeeId role department')
    .sort({ startTime: 1 });
};

StaffShiftSchema.statics.findActiveShifts = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return this.find({
    shiftDate: { $gte: today },
    status: 'In Progress'
  })
    .populate('staffId', 'name employeeId role department')
    .sort({ startTime: 1 });
};

StaffShiftSchema.statics.getShiftStats = function(startDate, endDate, department) {
  const matchQuery = {};
  
  if (startDate || endDate) {
    matchQuery.shiftDate = {};
    if (startDate) matchQuery.shiftDate.$gte = new Date(startDate);
    if (endDate) matchQuery.shiftDate.$lte = new Date(endDate);
  }
  
  if (department) {
    matchQuery.department = department;
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalShifts: { $sum: 1 },
        completedShifts: { 
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        cancelledShifts: { 
          $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
        },
        noShowShifts: { 
          $sum: { $cond: [{ $eq: ['$status', 'No Show'] }, 1, 0] }
        },
        totalHours: { $sum: '$attendance.totalHours' },
        totalOvertimeHours: { $sum: '$attendance.overtimeHours' },
        averageTaskCompletion: { $avg: '$performance.productivity.completionRate' }
      }
    }
  ]);
};

export default mongoose.models.StaffShift || mongoose.model("StaffShift", StaffShiftSchema);
