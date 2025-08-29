require('dotenv').config({ path: './.env.local' });
const initializeDatabase = require('../backend/models');

async function testInitialization() {
  console.log('--- Checking Environment Variables ---');
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_PORT: ${process.env.DB_PORT}`);
  console.log(`DB_NAME: ${process.env.DB_NAME}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
  console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? 'Loaded' : 'Not Loaded'}`);
  console.log('------------------------------------\n');

  console.log('Starting database initialization test...');
  try {
    const db = await initializeDatabase();
    if (db && db.sequelize) {
      console.log('Database initialization successful!');
      console.log('All models loaded and associated.');
      await db.sequelize.close();
      console.log('Database connection closed.');
    } else {
      console.error('Database initialization failed. No db object returned.');
    }
  } catch (error) {
    console.error('An error occurred during database initialization:', error);
  }
}

testInitialization();
