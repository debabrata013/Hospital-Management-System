import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // Basic Information
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true
  },
  passwordHash: { 
    type: String, 
    required: true,
    minlength: 6
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ["super-admin", "admin", "doctor", "staff", "receptionist", "patient"],
    required: true,
    index: true
  },
  permissions: [{
    module: {
      type: String,
      enum: ['patients', 'appointments', 'billing', 'inventory', 'reports', 'users', 'messages', 'shifts']
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'approve']
    }]
  }],
  
  // Contact Information
  contactNumber: {
    type: String,
    required: true,
    match: [/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'],
    index: true
  },
  alternateNumber: {
    type: String,
    match: [/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Professional Information (for staff)
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  department: {
    type: String,
    required: function() {
      return ['doctor', 'staff', 'admin', 'receptionist'].includes(this.role);
    },
    index: true
  },
  designation: String,
  specialization: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    }
  },
  qualification: [{
    degree: String,
    institution: String,
    year: Number,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  experience: {
    type: Number,
    min: 0,
    required: function() {
      return this.role === 'doctor';
    }
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    },
    unique: true,
    sparse: true
  },
  
  // Work Schedule
  workSchedule: {
    shift: {
      start: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
      },
      end: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
      }
    },
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    consultationFee: {
      type: Number,
      min: 0,
      required: function() {
        return this.role === 'doctor';
      }
    },
    maxPatientsPerDay: {
      type: Number,
      min: 1,
      max: 100,
      default: 20
    }
  },
  
  // Availability and Status
  availability: { 
    type: Boolean, 
    default: true 
  },
  currentStatus: {
    type: String,
    enum: ['available', 'busy', 'in-consultation', 'on-break', 'off-duty', 'on-leave'],
    default: 'available'
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    pincode: {
      type: String,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
    address: String
  },
  
  // Employment Details
  employment: {
    joiningDate: {
      type: Date,
      default: Date.now
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'consultant'],
      default: 'full-time'
    },
    salary: {
      type: Number,
      min: 0,
      required: function() {
        return ['doctor', 'staff', 'admin', 'receptionist'].includes(this.role);
      }
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String
    }
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    index: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Profile and Preferences
  profilePicture: String,
  preferences: {
    language: {
      type: String,
      enum: ['english', 'hindi'],
      default: 'english'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  
  // Two-Factor Authentication
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: String,
    backupCodes: [String]
  },
  
  // Session Management
  activeSessions: [{
    sessionId: String,
    deviceInfo: String,
    ipAddress: String,
    loginTime: Date,
    lastActivity: Date
  }],
  
  // For offline sync and audit
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
      delete ret.passwordHash;
      delete ret.twoFactorAuth.secret;
      delete ret.twoFactorAuth.backupCodes;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Compound Indexes for better performance
UserSchema.index({ role: 1, department: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ department: 1, availability: 1 });
UserSchema.index({ employeeId: 1 }, { sparse: true });
UserSchema.index({ licenseNumber: 1 }, { sparse: true });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for account locked status
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware
UserSchema.pre('save', function(next) {
  // Generate employeeId if not provided for staff
  if (!this.employeeId && ['doctor', 'staff', 'admin', 'receptionist'].includes(this.role)) {
    const rolePrefix = {
      'doctor': 'DOC',
      'staff': 'STF',
      'admin': 'ADM',
      'receptionist': 'REC'
    };
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.employeeId = `${rolePrefix[this.role]}${timestamp}${random}`;
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Methods
UserSchema.methods.isDoctor = function() {
  return this.role === 'doctor';
};

UserSchema.methods.isAdmin = function() {
  return ['super-admin', 'admin'].includes(this.role);
};

UserSchema.methods.isPatient = function() {
  return this.role === 'patient';
};

UserSchema.methods.hasPermission = function(module, action) {
  if (this.role === 'super-admin') return true;
  
  const permission = this.permissions.find(p => p.module === module);
  return permission && permission.actions.includes(action);
};

UserSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

UserSchema.methods.addActiveSession = function(sessionData) {
  this.activeSessions.push({
    ...sessionData,
    loginTime: new Date(),
    lastActivity: new Date()
  });
  
  // Keep only last 5 sessions
  if (this.activeSessions.length > 5) {
    this.activeSessions = this.activeSessions.slice(-5);
  }
  
  return this.save();
};

UserSchema.methods.removeActiveSession = function(sessionId) {
  this.activeSessions = this.activeSessions.filter(s => s.sessionId !== sessionId);
  return this.save();
};

// Static methods
UserSchema.statics.findByRole = function(role, isActive = true) {
  return this.find({ role, isActive }).sort({ name: 1 });
};

UserSchema.statics.findDoctorsByDepartment = function(department) {
  return this.find({ 
    role: 'doctor', 
    department, 
    isActive: true,
    availability: true 
  }).sort({ name: 1 });
};

UserSchema.statics.getAvailableDoctors = function() {
  return this.find({
    role: 'doctor',
    isActive: true,
    availability: true,
    currentStatus: { $in: ['available', 'on-break'] }
  }).sort({ name: 1 });
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
