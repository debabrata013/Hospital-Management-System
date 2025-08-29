const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Billing = sequelize.define('Billing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue'),
    allowNull: false,
    defaultValue: 'pending',
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true, // Null if not yet paid
  },
  });

  Billing.associate = (models) => {
    Billing.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient',
    });
  };

  return Billing;
};
