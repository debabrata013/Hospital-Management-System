// Hospital Management System - Model Exports
// This file exports all Mongoose models for easy importing

// Import all models
const User = require('./User.js');
const Patient = require('./Patient.js');
const MedicalRecord = require('./MedicalRecord.js');
const Billing = require('./Billing.js');
const Medicine = require('./Medicine.js');
const Message = require('./Message.js');
const Appointment = require('./Appointment.js');
const AuditLog = require('./AuditLog.js');

// Export all models
module.exports = {
  User,
  Patient,
  MedicalRecord,
  Billing,
  Medicine,
  Message,
  Appointment,
  AuditLog
};

// For ES6 imports
module.exports.User = User;
module.exports.Patient = Patient;
module.exports.MedicalRecord = MedicalRecord;
module.exports.Billing = Billing;
module.exports.Medicine = Medicine;
module.exports.Message = Message;
module.exports.Appointment = Appointment;
module.exports.AuditLog = AuditLog;

// Model names for reference
module.exports.ModelNames = {
  USER: 'User',
  PATIENT: 'Patient',
  MEDICAL_RECORD: 'MedicalRecord',
  BILLING: 'Billing',
  MEDICINE: 'Medicine',
  MESSAGE: 'Message',
  APPOINTMENT: 'Appointment',
  AUDIT_LOG: 'AuditLog'
};

// Collection names for direct database operations
module.exports.CollectionNames = {
  USERS: 'users',
  PATIENTS: 'patients',
  MEDICAL_RECORDS: 'medicalrecords',
  BILLING: 'billings',
  MEDICINES: 'medicines',
  MESSAGES: 'messages',
  APPOINTMENTS: 'appointments',
  AUDIT_LOGS: 'auditlogs'
};
