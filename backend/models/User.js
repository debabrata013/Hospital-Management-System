const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {}

  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
      set(value) {
        throw new Error('Do not try to set the `name` value!');
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('patient', 'doctor', 'admin', 'super-admin', 'hr_manager', 'department_head'),
      allowNull: false
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true, // Adds createdAt and updatedAt timestamps
  });

  User.associate = (models) => {
    User.hasMany(models.Appointment, {
      foreignKey: 'doctorId',
      as: 'appointments',
    });
    User.hasMany(models.Prescription, {
      foreignKey: 'doctorId',
      as: 'prescriptions',
    });
    User.hasMany(models.Task, {
      foreignKey: 'assignedToId',
      as: 'tasks',
    });
    User.hasMany(models.File, {
      foreignKey: 'uploaderId',
      as: 'uploadedFiles',
    });
    User.hasMany(models.AuditLog, {
      foreignKey: 'userId',
      as: 'auditLogs',
    });
    User.hasMany(models.LeaveRequest, {
      foreignKey: 'userId',
      as: 'leaveRequests',
    });
    User.hasMany(models.Message, {
      foreignKey: 'senderId',
      as: 'sentMessages',
    });
    User.hasMany(models.Message, {
      foreignKey: 'receiverId',
      as: 'receivedMessages',
    });
    User.hasOne(models.StaffProfile, {
      foreignKey: 'userId',
      as: 'staffProfile',
    });
    User.hasMany(models.StaffShift, {
      foreignKey: 'staffId',
      as: 'shifts',
    });
  };

  return User;
};
