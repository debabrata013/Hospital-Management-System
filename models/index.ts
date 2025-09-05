// This file exports mock models for development. Replace with real models as needed.

import User from './User';

// Mock AuditLog model
const AuditLog = {
  create: async (data: any) => {
    console.log('AuditLog.create called with:', data);
    return { id: Date.now(), ...data };
  }
};

const models = { User, AuditLog };
export default models;

// Database collection names
export enum Collections {
  USERS = 'users',
  PATIENTS = 'patients',
  APPOINTMENTS = 'appointments',
  MEDICAL_RECORDS = 'medical_records',
  BILLING = 'billing',
  AUDIT_LOGS = 'audit_logs',
  CLEANING_TASKS = 'cleaning_tasks',
  CLEANING_STAFF = 'cleaning_staff',
  ROOMS = 'rooms'
}
