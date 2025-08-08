import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  passwordHash: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ["super-admin", "admin", "doctor", "staff", "receptionist", "patient"],
    required: true
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  department: {
    type: String,
    required: function() {
      return ['doctor', 'staff', 'admin'].includes(this.role);
    }
  },
  specialization: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    }
  },
  qualification: [{
    type: String
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
    }
  },
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
  availability: { 
    type: Boolean, 
    default: true 
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: {
      type: String,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid pincode']
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    min: 0,
    required: function() {
      return ['doctor', 'staff', 'admin', 'receptionist'].includes(this.role);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  profilePicture: String,
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
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ contactNumber: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Pre-save middleware to update lastUpdated
UserSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Method to check if user is doctor
UserSchema.methods.isDoctor = function() {
  return this.role === 'doctor';
};

// Method to check if user is admin
UserSchema.methods.isAdmin = function() {
  return ['super-admin', 'admin'].includes(this.role);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
