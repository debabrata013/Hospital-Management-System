const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkStaffProfilesStructure() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('Connected to database successfully!');

    // Check the structure of staff_profiles table
    console.log('\n=== Checking staff_profiles table structure ===');
    const [columns] = await connection.execute("DESCRIBE staff_profiles");
    console.log('Staff profiles columns:', JSON.stringify(columns, null, 2));

    // Check if there are any staff_profiles records
    console.log('\n=== Checking staff_profiles records ===');
    const [profiles] = await connection.execute("SELECT * FROM staff_profiles LIMIT 5");
    console.log('Staff profiles records:', JSON.stringify(profiles, null, 2));

    // Check users table structure to see what fields are available
    console.log('\n=== Checking users table columns ===');
    const [userColumns] = await connection.execute("DESCRIBE users");
    console.log('Users table columns:', JSON.stringify(userColumns, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkStaffProfilesStructure();