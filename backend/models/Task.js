const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Task extends Model {}

  Task.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('prescription_review', 'lab_review', 'ai_summary', 'other'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
    dueDate: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: 'assignedToId',
      as: 'assignedTo',
    });
    Task.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient',
    });
  };

  return Task;
};
