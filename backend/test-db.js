import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

console.log('Attempting to connect to MySQL...');
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log('---');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ SUCCESS: Connection to MySQL has been established successfully.');
  } catch (error) {
    console.error('❌ FAILED: Unable to connect to the database.');
    console.error('Error Details:', error.name);
    if (error.original) {
        console.error('Original Error Code:', error.original.code);
    }
    console.log('\nPlease double-check that your MySQL server is running and that the credentials in your .env file are correct.');
  } finally {
    await sequelize.close();
  }
}

testConnection();
