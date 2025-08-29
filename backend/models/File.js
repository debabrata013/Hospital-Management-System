const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class File extends Model {}

  File.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for general uploads
    },
    uploaderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    patientId: {
      type: DataTypes.UUID, // Corrected from INTEGER to UUID
      allowNull: true, // Not all files may be linked to a patient
      references: {
        model: 'Patients', // Corrected from Users to Patients
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'File',
    timestamps: true,
  });

  File.associate = (models) => {
    File.belongsTo(models.User, {
      foreignKey: 'uploaderId',
      as: 'uploader',
    });
    File.belongsTo(models.Patient, {
      foreignKey: 'patientId',
      as: 'patient',
    });
  };

  return File;
};
