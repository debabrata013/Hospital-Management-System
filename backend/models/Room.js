const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define Room model
const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
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
});

// Add instance methods
Room.prototype.isAvailable = function() {
  return this.status === 'available' && this.currentOccupancy < this.capacity;
};

Room.prototype.admitPatient = async function() {
  if (!this.isAvailable()) {
    throw new Error('Room is not available');
  }
  
  this.currentOccupancy += 1;
  if (this.currentOccupancy >= this.capacity) {
    this.status = 'occupied';
  }
  
  return this.save();
};

Room.prototype.dischargePatient = async function() {
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
};

// Create test function
const testRoom = async () => {
  console.log('Starting Room model test...');
  try {
    // Sync the model with the database
    await sequelize.sync({ force: true });
    console.log('Room table created successfully!');

    // Create a test room
    const room = await Room.create({
      roomNumber: '101',
      type: 'General',
      floor: 1,
      capacity: 2,
      currentOccupancy: 0,
      status: 'available'
    });
    console.log('Test room created:', room.toJSON());

    // Test room availability
    console.log('Is room available?', room.isAvailable());

    // Test admitting a patient
    await room.admitPatient();
    console.log('After admitting first patient:', room.toJSON());

    // Test admitting another patient
    await room.admitPatient();
    console.log('After admitting second patient:', room.toJSON());

    // Test discharging patients
    await room.dischargePatient();
    console.log('After discharging first patient:', room.toJSON());

    await room.dischargePatient();
    console.log('After discharging second patient:', room.toJSON());

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit();
  }
};

// Run the test if this file is run directly
if (require.main === module) {
  testRoom();
}

module.exports = Room;
