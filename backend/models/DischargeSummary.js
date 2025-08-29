const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DischargeSummary = sequelize.define('DischargeSummary', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dischargeDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  DischargeSummary.associate = (models) => {
    DischargeSummary.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient',
    });
  };

  return DischargeSummary;
};
