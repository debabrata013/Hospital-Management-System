const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TestReport = sequelize.define('TestReport', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reportName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateCreated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  TestReport.associate = (models) => {
    TestReport.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient',
    });
  };

  return TestReport;
};
