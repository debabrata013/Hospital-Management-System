import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';
import User from './User';

// Interface for model attributes
interface LeaveRequestAttributes {
  id: number;
  user_id: number;
  leave_type: string;
  start_date: Date;
  end_date: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// Interface for model creation attributes (some fields are optional during creation)
interface LeaveRequestCreationAttributes extends Optional<LeaveRequestAttributes, 'id' | 'status'> {}

class LeaveRequest
  extends Model<LeaveRequestAttributes, LeaveRequestCreationAttributes>
  implements LeaveRequestAttributes {
  public id!: number;
  public user_id!: number;
  public leave_type!: string;
  public start_date!: Date;
  public end_date!: Date;
  public reason!: string;
  public status!: 'Pending' | 'Approved' | 'Rejected';

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeaveRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    leave_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    },
  },
  {
    sequelize,
    modelName: 'LeaveRequest',
    tableName: 'leave_request',
  }
);


export default LeaveRequest;
