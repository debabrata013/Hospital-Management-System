const { Sequelize, DataTypes } = require('sequelize');

// Create a new Sequelize instance with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: console.log
});

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
    type: DataTypes.STRING,
    defaultValue: 'available'
  }
});

// Simple test function
async function testRoom() {
  try {
    console.log('Testing Room model...');
    
    // Sync the model with the database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create a test room
    const room = await Room.create({
      roomNumber: '101',
      type: 'General',
      floor: 1,
      capacity: 2
    });
    console.log('Room created:', room.toJSON());

    // Find the room
    const foundRoom = await Room.findOne({ where: { roomNumber: '101' } });
    console.log('Found room:', foundRoom.toJSON());

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

// Run the test
testRoom();
