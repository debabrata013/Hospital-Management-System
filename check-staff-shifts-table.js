const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkStaffShiftsTable() {
  let connection;
  
  try {
    console.log('Checking staff_shifts table structure...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('Connected to database successfully!');

    // Check the structure of staff_shifts table
    console.log('\n=== Checking staff_shifts table structure ===');
    const [columns] = await connection.execute("DESCRIBE staff_shifts");
    console.log('staff_shifts columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `KEY: ${col.Key}` : ''} ${col.Default !== null ? `DEFAULT: ${col.Default}` : ''}`);
    });

    // Check if there are any existing records
    console.log('\n=== Checking existing staff_shifts records ===');
    const [records] = await connection.execute("SELECT * FROM staff_shifts LIMIT 3");
    console.log(`Found ${records.length} records in staff_shifts table`);
    if (records.length > 0) {
      console.log('Sample record:', JSON.stringify(records[0], null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkStaffShiftsTable();