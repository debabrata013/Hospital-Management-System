const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

const File = sequelize.define('File', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filetype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true, // Allow null for general uploads
  },
  uploaderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Not all files may be linked to a patient
    references: {
      model: 'Users', // Assuming patients are also in the Users table
      key: 'id',
    },
  },
});

module.exports = File;
