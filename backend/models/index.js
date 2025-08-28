const sequelize = require('../config/database');
const User = require('./User');
const File = require('./File');
const CleaningTask = require('./CleaningTask');
const CleaningStaff = require('./CleaningStaff');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Task = require('./Task');

const models = {
  User,
  File,
  CleaningTask,
  CleaningStaff,
  Patient,
  Appointment,
  Task,
};

// Define associations here if any
// For example, a user can have many files:
User.hasMany(File, { foreignKey: 'uploaderId', as: 'uploads' });
File.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });

// A doctor (User) has many appointments
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

// A patient has many appointments
Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Appointment.belongsTo(Patient, { as: 'patient', foreignKey: 'patientId' });

// A task is assigned to a user (doctor)
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'tasks' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });

// A task is related to a patient
Patient.hasMany(Task, { foreignKey: 'patientId', as: 'patientTasks' });
Task.belongsTo(Patient, { as: 'patient', foreignKey: 'patientId' });

const db = {
  ...models,
  sequelize,
};

module.exports = db;
