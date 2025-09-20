require('dotenv').config({ path: './.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function findUserByMobile(mobileNumber) {
  let connection;
  try {
    console.log(`Connecting to database '${dbConfig.database}'...`);
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection successful.');

    console.log(`Searching for user with mobile number: ${mobileNumber}`);
    const [rows] = await connection.execute(
      'SELECT id, user_id, name, email, role, contact_number, is_active FROM users WHERE contact_number = ?',
      [mobileNumber]
    );

    if (rows.length > 0) {
      console.log('--- User Found ---');
      console.log(JSON.stringify(rows[0], null, 2));
      console.log('------------------');
    } else {
      console.log('--- No user found with that mobile number. ---');
    }

  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

// The mobile number to search for
const mobileToFind = '9898989898';
findUserByMobile(mobileToFind);
