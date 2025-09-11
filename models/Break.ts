import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';

// Interface for model attributes
interface BreakAttributes {
  id: number;
  user_id: number;
  start_time: Date;
  end_time: Date | null;
  duration: number | null; // in seconds
}

// Interface for model creation attributes
interface BreakCreationAttributes extends Optional<BreakAttributes, 'id' | 'end_time' | 'duration'> {}

class Break extends Model<BreakAttributes, BreakCreationAttributes> implements BreakAttributes {
  public id!: number;
  public user_id!: number;
  public start_time!: Date;
  public end_time!: Date | null;
  public duration!: number | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Break.init(
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
        model: "users",
        key: 'id',
      },
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER, // Storing duration in seconds
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Break',
    tableName: 'breaks',
    timestamps: false,
  }
);


export default Break;
