const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Initializing database connection...');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // Use in-memory SQLite database
  logging: console.log // Enable logging for debugging
});

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
