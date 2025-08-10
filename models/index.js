// Hospital Management System - Model Exports
// This file exports all Mongoose models for easy importing

// Import all models
const User = require('./User.js');
const Patient = require('./Patient.js');
const MedicalRecord = require('./MedicalRecord.js');
const Appointment = require('./Appointment.js');
const Billing = require('./Billing.js');
const Prescription = require('./Prescription.js');
const TestReport = require('./TestReport.js');
const DischargeSummary = require('./DischargeSummary.js');
const AfterCareInstruction = require('./AfterCareInstruction.js');
const Medicine = require('./Medicine.js');
const Message = require('./Message.js');
const AuditLog = require('./AuditLog.js');

// Export all models (CommonJS)
const models = {
  User,
  Patient,
  MedicalRecord,
  Appointment,
  Billing,
  Prescription,
  TestReport,
  DischargeSummary,
  AfterCareInstruction,
  Medicine,
  Message,
  AuditLog
};

module.exports = models;

// For ES6 imports - export as default and named exports
module.exports.default = models;
module.exports.User = User;
module.exports.Patient = Patient;
module.exports.MedicalRecord = MedicalRecord;
module.exports.Appointment = Appointment;
module.exports.Billing = Billing;
module.exports.Prescription = Prescription;
module.exports.TestReport = TestReport;
module.exports.DischargeSummary = DischargeSummary;
module.exports.AfterCareInstruction = AfterCareInstruction;
module.exports.Medicine = Medicine;
module.exports.Message = Message;
module.exports.AuditLog = AuditLog;

// Model names for reference
module.exports.ModelNames = {
  USER: 'User',
  PATIENT: 'Patient',
  MEDICAL_RECORD: 'MedicalRecord',
  APPOINTMENT: 'Appointment',
  BILLING: 'Billing',
  PRESCRIPTION: 'Prescription',
  TEST_REPORT: 'TestReport',
  DISCHARGE_SUMMARY: 'DischargeSummary',
  AFTER_CARE_INSTRUCTION: 'AfterCareInstruction',
  MEDICINE: 'Medicine',
  MESSAGE: 'Message',
  AUDIT_LOG: 'AuditLog'
};

// Collection names for direct database operations
module.exports.CollectionNames = {
  USERS: 'users',
  PATIENTS: 'patients',
  MEDICAL_RECORDS: 'medicalrecords',
  APPOINTMENTS: 'appointments',
  BILLING: 'billings',
  PRESCRIPTIONS: 'prescriptions',
  TEST_REPORTS: 'testreports',
  DISCHARGE_SUMMARIES: 'dischargesummaries',
  AFTER_CARE_INSTRUCTIONS: 'aftercareinstructions',
  MEDICINES: 'medicines',
  MESSAGES: 'messages',
  AUDIT_LOGS: 'auditlogs'
};

// Patient Portal accessible models
module.exports.PatientPortalModels = {
  MEDICAL_RECORD: 'MedicalRecord',
  PRESCRIPTION: 'Prescription',
  TEST_REPORT: 'TestReport',
  DISCHARGE_SUMMARY: 'DischargeSummary',
  AFTER_CARE_INSTRUCTION: 'AfterCareInstruction',
  APPOINTMENT: 'Appointment',
  BILLING: 'Billing'
};

// Role-based model access permissions
module.exports.RolePermissions = {
  'super-admin': ['*'], // All models
  'admin': [
    'User', 'Patient', 'MedicalRecord', 'Appointment', 'Billing', 
    'Prescription', 'TestReport', 'DischargeSummary', 'Medicine', 
    'Message', 'AuditLog'
  ],
  'doctor': [
    'Patient', 'MedicalRecord', 'Appointment', 'Prescription', 
    'TestReport', 'DischargeSummary', 'AfterCareInstruction', 
    'Medicine', 'Message'
  ],
  'staff': [
    'Patient', 'MedicalRecord', 'Appointment', 'TestReport', 
    'AfterCareInstruction', 'Message'
  ],
  'receptionist': [
    'Patient', 'Appointment', 'Billing', 'Message'
  ],
  'patient': [
    'MedicalRecord', 'Prescription', 'TestReport', 'DischargeSummary', 
    'AfterCareInstruction', 'Appointment'
  ]
};

// Database relationship mappings
module.exports.Relationships = {
  Patient: {
    hasMany: ['MedicalRecord', 'Appointment', 'Billing', 'Prescription', 'TestReport', 'DischargeSummary', 'AfterCareInstruction'],
    belongsTo: ['User'] // for portal access
  },
  User: {
    hasMany: ['MedicalRecord', 'Appointment', 'Prescription', 'TestReport', 'DischargeSummary', 'AfterCareInstruction', 'Message', 'AuditLog'],
    belongsTo: []
  },
  MedicalRecord: {
    belongsTo: ['Patient', 'User'],
    hasMany: ['Prescription', 'TestReport'],
    hasOne: ['Appointment']
  },
  Appointment: {
    belongsTo: ['Patient', 'User'],
    hasOne: ['MedicalRecord', 'Billing']
  },
  Prescription: {
    belongsTo: ['Patient', 'User', 'MedicalRecord', 'Appointment']
  },
  TestReport: {
    belongsTo: ['Patient', 'User', 'MedicalRecord', 'Appointment']
  },
  DischargeSummary: {
    belongsTo: ['Patient', 'User'],
    hasMany: ['AfterCareInstruction']
  },
  AfterCareInstruction: {
    belongsTo: ['Patient', 'User', 'MedicalRecord', 'DischargeSummary']
  },
  Billing: {
    belongsTo: ['Patient', 'Appointment']
  }
};

// Validation schemas for common operations
module.exports.ValidationSchemas = {
  patientRegistration: [
    'name', 'dob', 'gender', 'contactNumber', 'address'
  ],
  appointmentBooking: [
    'patientId', 'doctorId', 'appointmentDate', 'appointmentTime', 'reason'
  ],
  medicalRecordCreation: [
    'patientId', 'doctorId', 'chiefComplaint', 'diagnosis'
  ],
  prescriptionCreation: [
    'patientId', 'doctorId', 'medications'
  ],
  billingCreation: [
    'patientId', 'items', 'totalAmount'
  ]
};

// Search indexes configuration
module.exports.SearchIndexes = {
  Patient: ['name', 'patientId', 'contactNumber', 'email'],
  User: ['name', 'email', 'employeeId'],
  MedicalRecord: ['diagnosis.primary.condition'],
  Appointment: ['patientId', 'doctorId', 'appointmentDate'],
  Prescription: ['medications.medicineName'],
  TestReport: ['testName', 'testCategory'],
  Medicine: ['name', 'genericName']
};

// Audit configuration
module.exports.AuditConfig = {
  auditableModels: [
    'User', 'Patient', 'MedicalRecord', 'Prescription', 
    'TestReport', 'DischargeSummary', 'Billing'
  ],
  auditActions: [
    'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'DOWNLOAD', 'SHARE'
  ],
  sensitiveFields: [
    'passwordHash', 'twoFactorAuth', 'internalNotes'
  ]
};
