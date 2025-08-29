const { Sequelize } = require('sequelize');

let sequelize = null;

async function connectToDatabase() {
  if (sequelize) {
    return sequelize;
  }

  console.log('Initializing new database connection...');

  try {
    console.log('[DB Config] Creating new Sequelize instance...');
    const newSequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      logging: false, // Disabled verbose logging
      dialectOptions: {
        connectTimeout: 120000 // 120 seconds
      }
    });
    console.log('[DB Config] Sequelize instance created.');

    console.log('[DB Config] Authenticating with the database...');
    await newSequelize.authenticate();
    console.log('[DB Config] Database connection has been established successfully.');
    sequelize = newSequelize;
    return sequelize;
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    throw err; // Re-throw error to be handled by the caller
  }
}

module.exports = connectToDatabase;
