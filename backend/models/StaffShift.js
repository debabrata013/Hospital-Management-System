const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StaffShift = sequelize.define('StaffShift', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    dayOfWeek: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      allowNull: false,
    },
  });

  StaffShift.associate = (models) => {
    StaffShift.belongsTo(models.User, {
      foreignKey: 'staffId',
      as: 'staff',
    });
  };

  return StaffShift;
};

