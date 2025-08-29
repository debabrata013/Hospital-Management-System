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
        references: {
            model: 'Rooms',
            key: 'roomNumber',
        }
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'CleaningStaffs',
        key: 'id',
      }
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

  CleaningTask.associate = (models) => {
    CleaningTask.belongsTo(models.Room, {
      foreignKey: 'roomNumber',
      targetKey: 'roomNumber', // Associate using the roomNumber
      as: 'room',
    });
    CleaningTask.belongsTo(models.CleaningStaff, {
      foreignKey: 'assignedTo', // This should be an ID
      as: 'staff',
    });
  };

  return CleaningTask;
};
