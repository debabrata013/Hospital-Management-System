const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CleaningStaff = sequelize.define('CleaningStaff', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    timestamps: true,
  });

  CleaningStaff.associate = (models) => {
    CleaningStaff.hasMany(models.CleaningTask, {
      foreignKey: 'assignedTo',
      as: 'tasks',
    });
  };

  return CleaningStaff;
};
