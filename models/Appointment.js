import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Patient",
    required: true
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  
  // Appointment Scheduling
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  duration: {
    type: Number, // Duration in minutes
    default: 30,
    min: 15,
    max: 180
  },
  
  // Appointment Details
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup', 'procedure', 'vaccination', 'counseling'],
    required: true,
    default: 'consultation'
  },
  visitType: {
    type: String,
    enum: ['first-visit', 'follow-up', 'routine', 'emergency'],
    default: 'first-visit'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Reason and Symptoms
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  symptoms: [String],
  chiefComplaint: String,
  
  // Appointment Status
  status: { 
    type: String, 
    enum: ["scheduled", "confirmed", "checked-in", "in-progress", "completed", "cancelled", "no-show", "rescheduled"], 
    default: "scheduled" 
  },
  
  // Booking Information
  bookingSource: {
    type: String,
    enum: ['online', 'phone', 'walk-in', 'referral', 'emergency'],
    default: 'online'
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // Staff member who booked (if not self-booked)
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  
  // Patient Information at Booking
  patientInfo: {
    name: String,
    phone: String,
    email: String,
    age: Number,
    gender: String,
    isNewPatient: {
      type: Boolean,
      default: false
    }
  },
  
  // Check-in Information
  checkIn: {
    checkedInAt: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    vitals: {
      bloodPressure: String,
      temperature: Number,
      pulse: Number,
      weight: Number,
      height: Number
    },
    waitingTime: Number, // in minutes
    queuePosition: Number
  },
  
  // Consultation Details
  consultation: {
    startTime: Date,
    endTime: Date,
    actualDuration: Number, // in minutes
    consultationNotes: String,
    diagnosis: String,
    treatmentPlan: String,
    prescriptionGiven: Boolean,
    followUpRequired: Boolean,
    followUpDate: Date,
    referralGiven: Boolean,
    referralDetails: String
  },
  
  // Payment and Billing
  billing: {
    consultationFee: {
      type: Number,
      required: true,
      min: 0
    },
    additionalCharges: [{
      description: String,
      amount: Number
    }],
    totalAmount: Number,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'waived'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'UPI', 'insurance', 'online']
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing"
    }
  },
  
  // Cancellation/Rescheduling
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    cancellationReason: {
      type: String,
      enum: ['patient-request', 'doctor-unavailable', 'emergency', 'illness', 'no-show', 'system-error', 'other']
    },
    cancellationNote: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['not-applicable', 'pending', 'processed', 'rejected']
    }
  },
  
  rescheduling: {
    originalDate: Date,
    originalTime: String,
    rescheduledAt: Date,
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    rescheduleReason: String,
    rescheduleCount: {
      type: Number,
      default: 0
    }
  },
  
  // Notifications and Reminders
  notifications: {
    confirmationSent: {
      type: Boolean,
      default: false
    },
    confirmationSentAt: Date,
    reminderSent: {
      type: Boolean,
      default: false
    },
    reminderSentAt: Date,
    followUpReminderSent: {
      type: Boolean,
      default: false
    },
    smsNotifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Special Requirements
  specialRequirements: {
    wheelchairAccess: Boolean,
    interpreter: Boolean,
    interpreterLanguage: String,
    assistanceRequired: Boolean,
    assistanceDetails: String,
    allergies: [String],
    medicalConditions: [String]
  },
  
  // Insurance Information
  insurance: {
    hasInsurance: {
      type: Boolean,
      default: false
    },
    provider: String,
    policyNumber: String,
    preAuthRequired: Boolean,
    preAuthNumber: String,
    coverageAmount: Number,
    copayAmount: Number
  },
  
  // Related Records
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord"
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription"
  },
  
  // Feedback and Rating
  feedback: {
    patientRating: {
      type: Number,
      min: 1,
      max: 5
    },
    patientFeedback: String,
    doctorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    serviceRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedbackDate: Date,
    wouldRecommend: Boolean
  },
  
  // System Fields
  isEmergency: {
    type: Boolean,
    default: false
  },
  isFollowUp: {
    type: Boolean,
    default: false
  },
  parentAppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },
  
  // Notes and Comments
  notes: String,
  internalNotes: String, // Not visible to patient
  
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
AppointmentSchema.index({ appointmentId: 1 });
AppointmentSchema.index({ patientId: 1, appointmentDate: -1 });
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentDate: 1, status: 1 });
AppointmentSchema.index({ bookingSource: 1 });
AppointmentSchema.index({ priority: 1 });

// Compound index for avoiding double booking
AppointmentSchema.index({ 
  doctorId: 1, 
  appointmentDate: 1, 
  appointmentTime: 1 
}, { 
  unique: true,
  partialFilterExpression: { 
    status: { $nin: ['cancelled', 'no-show'] } 
  }
});

// Virtual for appointment datetime
AppointmentSchema.virtual('appointmentDateTime').get(function() {
  if (this.appointmentDate && this.appointmentTime) {
    const [hours, minutes] = this.appointmentTime.split(':');
    const datetime = new Date(this.appointmentDate);
    datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return datetime;
  }
  return null;
});

// Virtual for end time
AppointmentSchema.virtual('appointmentEndTime').get(function() {
  if (this.appointmentDateTime) {
    const endTime = new Date(this.appointmentDateTime);
    endTime.setMinutes(endTime.getMinutes() + this.duration);
    return endTime;
  }
  return null;
});

// Virtual for is today
AppointmentSchema.virtual('isToday').get(function() {
  if (!this.appointmentDate) return false;
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return today.toDateString() === appointmentDate.toDateString();
});

// Virtual for is overdue
AppointmentSchema.virtual('isOverdue').get(function() {
  if (!this.appointmentDateTime) return false;
  return new Date() > this.appointmentDateTime && 
         !['completed', 'cancelled', 'no-show'].includes(this.status);
});

// Virtual for waiting time
AppointmentSchema.virtual('currentWaitingTime').get(function() {
  if (this.checkIn.checkedInAt && this.status === 'checked-in') {
    const now = new Date();
    const checkedIn = new Date(this.checkIn.checkedInAt);
    return Math.floor((now - checkedIn) / (1000 * 60)); // in minutes
  }
  return 0;
});

// Pre-save middleware
AppointmentSchema.pre('save', function(next) {
  // Generate appointmentId if not provided
  if (!this.appointmentId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    this.appointmentId = `APT${timestamp}${random}`;
  }
  
  // Calculate total billing amount
  if (this.billing.consultationFee) {
    const additionalTotal = this.billing.additionalCharges.reduce(
      (sum, charge) => sum + (charge.amount || 0), 0
    );
    this.billing.totalAmount = this.billing.consultationFee + additionalTotal;
  }
  
  // Set follow-up flag
  if (this.appointmentType === 'follow-up' || this.visitType === 'follow-up') {
    this.isFollowUp = true;
  }
  
  // Set emergency flag
  if (this.appointmentType === 'emergency' || this.priority === 'urgent') {
    this.isEmergency = true;
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Method to check in patient
AppointmentSchema.methods.performCheckIn = function(staffId, vitals = {}) {
  this.status = 'checked-in';
  this.checkIn = {
    checkedInAt: new Date(),
    checkedInBy: staffId,
    vitals: vitals
  };
  return this.save();
};

// Method to start consultation
AppointmentSchema.methods.startConsultation = function() {
  this.status = 'in-progress';
  this.consultation.startTime = new Date();
  return this.save();
};

// Method to complete appointment
AppointmentSchema.methods.complete = function(consultationData) {
  this.status = 'completed';
  this.consultation = {
    ...this.consultation,
    ...consultationData,
    endTime: new Date()
  };
  
  // Calculate actual duration
  if (this.consultation.startTime) {
    const duration = (new Date() - new Date(this.consultation.startTime)) / (1000 * 60);
    this.consultation.actualDuration = Math.round(duration);
  }
  
  return this.save();
};

// Method to cancel appointment
AppointmentSchema.methods.cancel = function(reason, cancelledBy, note = '') {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy,
    cancellationReason: reason,
    cancellationNote: note
  };
  return this.save();
};

// Method to reschedule appointment
AppointmentSchema.methods.reschedule = function(newDate, newTime, rescheduledBy, reason = '') {
  this.rescheduling = {
    originalDate: this.appointmentDate,
    originalTime: this.appointmentTime,
    rescheduledAt: new Date(),
    rescheduledBy,
    rescheduleReason: reason,
    rescheduleCount: (this.rescheduling.rescheduleCount || 0) + 1
  };
  
  this.appointmentDate = newDate;
  this.appointmentTime = newTime;
  this.status = 'scheduled';
  
  return this.save();
};

// Method to mark as no-show
AppointmentSchema.methods.markNoShow = function() {
  this.status = 'no-show';
  return this.save();
};

// Method to add feedback
AppointmentSchema.methods.addFeedback = function(feedbackData) {
  this.feedback = {
    ...feedbackData,
    feedbackDate: new Date()
  };
  return this.save();
};

// Static method to find appointments by date range
AppointmentSchema.statics.findByDateRange = function(startDate, endDate, doctorId = null) {
  const query = {
    appointmentDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (doctorId) {
    query.doctorId = doctorId;
  }
  
  return this.find(query)
    .populate('patientId', 'name patientId contactNumber')
    .populate('doctorId', 'name specialization department')
    .sort({ appointmentDate: 1, appointmentTime: 1 });
};

// Static method to find today's appointments
AppointmentSchema.statics.findTodaysAppointments = function(doctorId = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const query = {
    appointmentDate: {
      $gte: today,
      $lt: tomorrow
    }
  };
  
  if (doctorId) {
    query.doctorId = doctorId;
  }
  
  return this.find(query)
    .populate('patientId', 'name patientId contactNumber')
    .populate('doctorId', 'name specialization')
    .sort({ appointmentTime: 1 });
};

// Static method to check availability
AppointmentSchema.statics.checkAvailability = function(doctorId, date, time, duration = 30) {
  const appointmentStart = new Date(date);
  const [hours, minutes] = time.split(':');
  appointmentStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const appointmentEnd = new Date(appointmentStart);
  appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);
  
  return this.findOne({
    doctorId,
    appointmentDate: date,
    status: { $nin: ['cancelled', 'no-show'] },
    $or: [
      {
        // Existing appointment starts during new appointment
        appointmentTime: {
          $gte: time,
          $lt: appointmentEnd.toTimeString().substr(0, 5)
        }
      },
      {
        // New appointment starts during existing appointment
        $expr: {
          $and: [
            { $lte: ['$appointmentTime', time] },
            { 
              $gt: [
                { 
                  $dateAdd: {
                    startDate: {
                      $dateFromParts: {
                        year: { $year: '$appointmentDate' },
                        month: { $month: '$appointmentDate' },
                        day: { $dayOfMonth: '$appointmentDate' },
                        hour: { $toInt: { $substr: ['$appointmentTime', 0, 2] } },
                        minute: { $toInt: { $substr: ['$appointmentTime', 3, 2] } }
                      }
                    },
                    unit: 'minute',
                    amount: '$duration'
                  }
                },
                appointmentStart
              ]
            }
          ]
        }
      }
    ]
  });
};

// Static method to get appointment statistics
AppointmentSchema.statics.getAppointmentStats = function(startDate, endDate, doctorId = null) {
  const matchQuery = {
    appointmentDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (doctorId) {
    matchQuery.doctorId = doctorId;
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$billing.totalAmount' }
      }
    },
    {
      $group: {
        _id: null,
        statusCounts: {
          $push: {
            status: '$_id',
            count: '$count',
            revenue: '$totalRevenue'
          }
        },
        totalAppointments: { $sum: '$count' },
        totalRevenue: { $sum: '$totalRevenue' }
      }
    }
  ]);
};

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
