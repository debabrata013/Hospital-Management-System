const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Room extends Model {
    isAvailable() {
      return this.status === 'available' && this.currentOccupancy < this.capacity;
    }

    async admitPatient() {
      if (!this.isAvailable()) {
        throw new Error('Room is not available');
      }
      this.currentOccupancy += 1;
      if (this.currentOccupancy >= this.capacity) {
        this.status = 'occupied';
      }
      return this.save();
    }

    async dischargePatient() {
      if (this.currentOccupancy <= 0) {
        throw new Error('Room is already empty');
      }
      this.currentOccupancy -= 1;
      if (this.currentOccupancy === 0) {
        this.status = 'cleaning';
      } else if (this.currentOccupancy < this.capacity) {
        this.status = 'available';
      }
      return this.save();
    }
  }

  Room.init({
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    currentOccupancy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'cleaning', 'maintenance'),
      defaultValue: 'available'
    }
  }, {
    sequelize,
    modelName: 'Room',
    timestamps: true,
  });

  Room.associate = (models) => {
    Room.hasMany(models.Patient, {
      foreignKey: 'roomId',
      as: 'patients',
    });
    Room.hasMany(models.CleaningTask, {
      foreignKey: 'roomNumber',
      as: 'cleaningTasks',
    });
  };

  return Room;
};
