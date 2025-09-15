// Debug script to check doctor IDs in database
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

async function debugDoctors() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('=== ALL USERS WITH DOCTOR ROLE ===');
    const [allDoctors] = await connection.execute(
      `SELECT id, name, email, role, is_active FROM users WHERE role = 'doctor' ORDER BY id`
    );
    console.table(allDoctors);
    
    console.log('\n=== RECENT APPOINTMENTS WITH DOCTOR INFO ===');
    const [appointments] = await connection.execute(
      `SELECT 
        a.id, a.appointment_id, a.doctor_id, a.appointment_date,
        u.id as user_id, u.name as doctor_name, u.role
      FROM appointments a
      LEFT JOIN users u ON a.doctor_id = u.id
      ORDER BY a.id DESC LIMIT 10`
    );
    console.table(appointments);
    
    console.log('\n=== CHECKING FOR ID 22 IN USERS TABLE ===');
    const [user22] = await connection.execute(
      `SELECT * FROM users WHERE id = 22`
    );
    console.table(user22);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugDoctors();
