// Hospital Management System - Model Exports
// This file exports all Mongoose models for easy importing

// Import all models
const User = require('./User.js');
const Appointment = require('./Appointment.js');
const Billing = require('./Billing.js');
const Prescription = require('./Prescription.js');
const TestReport = require('./TestReport.js');
const DischargeSummary = require('./DischargeSummary.js');
const AfterCareInstruction = require('./AfterCareInstruction.js');
const Medicine = require('./Medicine.js');
const Message = require('./Message.js');
const AuditLog = require('./AuditLog.js');
const StaffProfile = require('./StaffProfile.js');
const StaffShift = require('./StaffShift.js');
const LeaveRequest = require('./LeaveRequest.js');
const PurchaseOrder = require('./PurchaseOrder.js');
const Vendor = require('./Vendor.js');

// Export all models (CommonJS)
const models = {
  User,
  Appointment,
  Billing,
  Prescription,
  TestReport,
  DischargeSummary,
  AfterCareInstruction,
  Medicine,
  Message,
  AuditLog,
  StaffProfile,
  StaffShift,
  LeaveRequest,
  PurchaseOrder,
  Vendor
};

module.exports = models;

// For ES6 imports - export as default and named exports
module.exports.default = models;
module.exports.User = User;
module.exports.Appointment = Appointment;
module.exports.Billing = Billing;
module.exports.Prescription = Prescription;
module.exports.TestReport = TestReport;
module.exports.DischargeSummary = DischargeSummary;
module.exports.AfterCareInstruction = AfterCareInstruction;
module.exports.Medicine = Medicine;
module.exports.Message = Message;
module.exports.AuditLog = AuditLog;
module.exports.StaffProfile = StaffProfile;
module.exports.StaffShift = StaffShift;
module.exports.LeaveRequest = LeaveRequest;
module.exports.PurchaseOrder = PurchaseOrder;
module.exports.Vendor = Vendor;

// Model names for reference
module.exports.ModelNames = {
  USER: 'User',
  APPOINTMENT: 'Appointment',
  BILLING: 'Billing',
  PRESCRIPTION: 'Prescription',
  TEST_REPORT: 'TestReport',
  DISCHARGE_SUMMARY: 'DischargeSummary',
  AFTER_CARE_INSTRUCTION: 'AfterCareInstruction',
  MEDICINE: 'Medicine',
  MESSAGE: 'Message',
  AUDIT_LOG: 'AuditLog',
  STAFF_PROFILE: 'StaffProfile',
  STAFF_SHIFT: 'StaffShift',
  LEAVE_REQUEST: 'LeaveRequest',
  PURCHASE_ORDER: 'PurchaseOrder',
  VENDOR: 'Vendor'
};

// Collection names for direct database operations
module.exports.CollectionNames = {
  USERS: 'users',
  APPOINTMENTS: 'appointments',
  BILLING: 'billings',
  PRESCRIPTIONS: 'prescriptions',
  TEST_REPORTS: 'testreports',
  DISCHARGE_SUMMARIES: 'dischargesummaries',
  AFTER_CARE_INSTRUCTIONS: 'aftercareinstructions',
  MEDICINES: 'medicines',
  MESSAGES: 'messages',
  AUDIT_LOGS: 'auditlogs',
  STAFF_PROFILES: 'staffprofiles',
  STAFF_SHIFTS: 'staffshifts',
  LEAVE_REQUESTS: 'leaverequests',
  PURCHASE_ORDERS: 'purchaseorders',
  VENDORS: 'vendors'
};

// Role-based model access permissions
module.exports.RolePermissions = {
  'super-admin': ['*'], // All models
  'admin': [
    'User', 'Appointment', 'Billing', 
    'Prescription', 'TestReport', 'DischargeSummary', 'Medicine', 
    'Message', 'AuditLog', 'StaffProfile', 'StaffShift', 'LeaveRequest'
  ],
  'doctor': [
    'Appointment', 'Prescription', 
    'TestReport', 'DischargeSummary', 'AfterCareInstruction', 
    'Medicine', 'Message'
  ],
  'staff': [
    'Appointment', 'TestReport', 
    'AfterCareInstruction', 'Message', 'StaffShift', 'LeaveRequest'
  ],
  'receptionist': [
    'Appointment', 'Billing', 'Message'
  ],
  'patient': [
    'Prescription', 'TestReport', 'DischargeSummary', 
    'AfterCareInstruction', 'Appointment'
  ]
};

// Database relationship mappings
module.exports.Relationships = {
  User: {
    hasMany: ['Appointment', 'Prescription', 'TestReport', 'DischargeSummary', 'AfterCareInstruction', 'Message', 'AuditLog', 'StaffShift', 'LeaveRequest'],
    belongsTo: []
  },
  Appointment: {
    belongsTo: ['User'],
    hasOne: ['Billing']
  },
  Prescription: {
    belongsTo: ['User', 'Appointment']
  },
  TestReport: {
    belongsTo: ['User', 'Appointment']
  },
  DischargeSummary: {
    belongsTo: ['User'],
    hasMany: ['AfterCareInstruction']
  },
  AfterCareInstruction: {
    belongsTo: ['User', 'DischargeSummary']
  },
  Billing: {
    belongsTo: ['Appointment']
  },
  StaffProfile: {
    belongsTo: ['User']
  },
  StaffShift: {
    belongsTo: ['User']
  },
  LeaveRequest: {
    belongsTo: ['User']
  }
};

// Validation schemas for common operations
module.exports.ValidationSchemas = {
  appointmentBooking: [
    'doctorId', 'appointmentDate', 'appointmentTime', 'reason'
  ],
  prescriptionCreation: [
    'doctorId', 'medications'
  ],
  billingCreation: [
    'items', 'totalAmount'
  ]
};

// Search indexes configuration
module.exports.SearchIndexes = {
  User: ['name', 'email', 'employeeId'],
  Appointment: ['doctorId', 'appointmentDate'],
  Prescription: ['medications.medicineName'],
  TestReport: ['testName', 'testCategory'],
  Medicine: ['name', 'genericName']
};

// Audit configuration
module.exports.AuditConfig = {
  auditableModels: [
    'User', 'Prescription', 
    'TestReport', 'DischargeSummary', 'Billing'
  ],
  auditActions: [
    'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'DOWNLOAD', 'SHARE'
  ],
  sensitiveFields: [
    'passwordHash', 'twoFactorAuth', 'internalNotes'
  ]
};
