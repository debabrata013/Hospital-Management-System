const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: false
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emergencyContact: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    diagnosis: {
      type: DataTypes.STRING,
      allowNull: false
    },
    admissionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    expectedDischargeDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    medications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    doctorName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    insuranceProvider: {
      type: DataTypes.STRING,
      allowNull: true
    },
    insuranceNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    roomId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('admitted', 'discharged', 'transferred'),
      defaultValue: 'admitted'
    }
  });

  Patient.associate = (models) => {
    Patient.hasMany(models.Appointment, {
      foreignKey: 'patientId',
      as: 'appointments',
    });
    Patient.belongsTo(models.Room, {
      foreignKey: 'roomId',
      as: 'room',
    });
    Patient.hasMany(models.Prescription, {
      foreignKey: 'patientId',
      as: 'prescriptions',
    });
    Patient.hasMany(models.Task, {
      foreignKey: 'patientId',
      as: 'tasks',
    });
    Patient.hasMany(models.Billing, {
      foreignKey: 'patientId',
      as: 'bills',
    });
    Patient.hasOne(models.DischargeSummary, {
      foreignKey: 'patientId',
      as: 'dischargeSummary',
    });
    Patient.hasMany(models.AfterCareInstruction, {
      foreignKey: 'patientId',
      as: 'afterCareInstructions',
    });
    Patient.hasMany(models.TestReport, {
      foreignKey: 'patientId',
      as: 'testReports',
    });
    Patient.hasMany(models.File, {
      foreignKey: 'patientId',
      as: 'files',
    });
  };

  return Patient;
};
