const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prescription = sequelize.define('Prescription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    datePrescribed: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  Prescription.associate = (models) => {
    Prescription.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient',
    });
    Prescription.belongsTo(models.User, {
      foreignKey: 'doctorId',
      as: 'doctor',
    });
    Prescription.belongsTo(models.Medicine, {
      foreignKey: 'medicineId',
      as: 'medicine',
    });
  };

  return Prescription;
};
