const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CleaningTask = sequelize.define('CleaningTask', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
      allowNull: false,
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  return CleaningTask;
};
