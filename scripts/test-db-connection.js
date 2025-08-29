require('dotenv').config({ path: '.env.local' });
const connectToDatabase = require('../backend/config/database');

async function testConnection() {
  console.log('Attempting to connect to the database...');
  try {
    const sequelize = await connectToDatabase();
    await sequelize.close();
    console.log('Database connection successful and closed.');
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
