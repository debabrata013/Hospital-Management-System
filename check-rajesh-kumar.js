// Check for Dr. Rajesh Kumar entries in database
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306'),
  charset: 'utf8mb4',
  timezone: '+05:30',
};

async function checkRajeshKumar() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('=== SEARCHING FOR RAJESH KUMAR ===');
    const [rajeshEntries] = await connection.execute(
      `SELECT id, name, email, role, is_active, created_at FROM users WHERE name LIKE '%Rajesh%' OR name LIKE '%Kumar%' ORDER BY id`
    );
    console.table(rajeshEntries);
    
    console.log('\n=== USER ID 3 DETAILS ===');
    const [user3] = await connection.execute(
      `SELECT * FROM users WHERE id = 3`
    );
    console.table(user3);
    
    console.log('\n=== USER ID 22 DETAILS ===');
    const [user22] = await connection.execute(
      `SELECT * FROM users WHERE id = 22`
    );
    console.table(user22);
    
    console.log('\n=== ALL DOCTOR ROLE USERS ===');
    const [allDoctors] = await connection.execute(
      `SELECT id, name, email, role, is_active FROM users WHERE role = 'doctor' ORDER BY id`
    );
    console.table(allDoctors);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkRajeshKumar();
