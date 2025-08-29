const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AfterCareInstruction = sequelize.define('AfterCareInstruction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    instruction: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dateGiven: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  AfterCareInstruction.associate = (models) => {
    AfterCareInstruction.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient',
    });
  };

  return AfterCareInstruction;
};
