const sequelize = require('../config/database');
const User = require('./User');
const File = require('./File');
const CleaningTask = require('./CleaningTask');
const CleaningStaff = require('./CleaningStaff');

const models = {
  User,
  File,
  CleaningTask,
  CleaningStaff,
};

// Define associations here if any
// For example, a user can have many files:
User.hasMany(File, { foreignKey: 'uploaderId', as: 'uploads' });
File.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });

const db = {
  ...models,
  sequelize,
};

module.exports = db;
