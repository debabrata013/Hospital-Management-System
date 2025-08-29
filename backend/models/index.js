const connectToDatabase = require('../config/database');

// Import all models
const AfterCareInstruction = require('./AfterCareInstruction');
const Appointment = require('./Appointment');
const AuditLog = require('./AuditLog');
const Billing = require('./Billing');
const CleaningStaff = require('./CleaningStaff');
const CleaningTask = require('./CleaningTask');
const DischargeSummary = require('./DischargeSummary');
const File = require('./File');
const LeaveRequest = require('./LeaveRequest');
const Medicine = require('./Medicine');
const Message = require('./Message');
const Patient = require('./Patient');
const Prescription = require('./Prescription');
const Room = require('./Room');
const StaffProfile = require('./StaffProfile');
const StaffShift = require('./StaffShift');
const Task = require('./Task');
const TestReport = require('./TestReport');
const User = require('./User');

let db = null;

async function initializeDatabase() {
  console.log('[DB] Attempting to initialize database...');
  if (db) {
    console.log('[DB] Database instance already exists. Returning...');
    return db;
  }

  console.log('[DB] Connecting to database...');
  const sequelize = await connectToDatabase();
  console.log('[DB] Database connection successful. Initializing models...');

  const modelInitializers = {
    AfterCareInstruction: AfterCareInstruction(sequelize),
    Appointment: Appointment(sequelize),
    AuditLog: AuditLog(sequelize),
    Billing: Billing(sequelize),
    CleaningStaff: CleaningStaff(sequelize),
    CleaningTask: CleaningTask(sequelize),
    DischargeSummary: DischargeSummary(sequelize),
    File: File(sequelize),
    LeaveRequest: LeaveRequest(sequelize),
    Medicine: Medicine(sequelize),
    Message: Message(sequelize),
    Patient: Patient(sequelize),
    Prescription: Prescription(sequelize),
    Room: Room(sequelize),
    StaffProfile: StaffProfile(sequelize),
    StaffShift: StaffShift(sequelize),
    Task: Task(sequelize),
    TestReport: TestReport(sequelize),
    User: User(sequelize),
  };

  const models = {};
  console.log('[DB] --- Loading Models ---');
  for (const modelName in modelInitializers) {
    console.log(`[DB] Loading model: ${modelName}`);
    models[modelName] = modelInitializers[modelName];
  }
  console.log('[DB] --- Finished Loading Models ---');

  // Set up associations
  console.log('[DB] --- Associating Models ---');
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      console.log(`[DB] Associating model: ${modelName}`);
      models[modelName].associate(models);
    }
  });
  console.log('[DB] --- Finished Associating Models ---');

  db = {
    sequelize,
    ...models,
  };

  console.log('[DB] Database initialization complete.');
  return db;
}

module.exports = initializeDatabase;
