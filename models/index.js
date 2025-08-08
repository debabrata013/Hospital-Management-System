// Hospital Management System - Model Exports
// This file exports all Mongoose models for easy importing

import User from './User.js';
import Patient from './Patient.js';
import MedicalRecord from './MedicalRecord.js';
import Billing from './Billing.js';
import Medicine from './Medicine.js';
import Message from './Message.js';
import Appointment from './Appointment.js';
import AuditLog from './AuditLog.js';

// Export all models
export {
  User,
  Patient,
  MedicalRecord,
  Billing,
  Medicine,
  Message,
  Appointment,
  AuditLog
};

// Default export with all models
export default {
  User,
  Patient,
  MedicalRecord,
  Billing,
  Medicine,
  Message,
  Appointment,
  AuditLog
};

// Model names for reference
export const ModelNames = {
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
export const CollectionNames = {
  USERS: 'users',
  PATIENTS: 'patients',
  MEDICAL_RECORDS: 'medicalrecords',
  BILLING: 'billings',
  MEDICINES: 'medicines',
  MESSAGES: 'messages',
  APPOINTMENTS: 'appointments',
  AUDIT_LOGS: 'auditlogs'
};
