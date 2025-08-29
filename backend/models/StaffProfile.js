const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StaffProfile = sequelize.define('StaffProfile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    specialty: {
      type: DataTypes.STRING,
    },
    qualifications: {
      type: DataTypes.STRING,
    },
  });

  StaffProfile.associate = (models) => {
    StaffProfile.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return StaffProfile;
};
