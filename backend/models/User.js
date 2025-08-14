import { DataTypes } from 'sequelize';

const defineUserModel = (sequelize) => {
  const User = sequelize.define('User', {
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
      unique: true,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return User;
};

export default defineUserModel;
