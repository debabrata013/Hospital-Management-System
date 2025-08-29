const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize = null;

async function connectToDatabase() {
  if (sequelize) {
    return sequelize;
  }

  console.log('Initializing new database connection...');
  const newSequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, // Disabled verbose logging
    dialectOptions: {
      connectTimeout: 10000 // 10 seconds
    }
  });

  try {
    await newSequelize.authenticate();
    console.log('Database connection established successfully.');
    sequelize = newSequelize;
    return sequelize;
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    throw err; // Re-throw error to be handled by the caller
  }
}

module.exports = connectToDatabase;
