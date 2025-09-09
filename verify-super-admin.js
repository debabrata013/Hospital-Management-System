const mysql = require('mysql2/promise');

async function verifySuperAdmin() {
  const connection = await mysql.createConnection({
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital'
  });

  try {
    const [rows] = await connection.execute(
      'SELECT user_id, name, email, role, contact_number, is_active, created_at FROM users WHERE role = ? OR contact_number = ?',
      ['super-admin', '9876543210']
    );

    console.log('🔍 Super Admin Users Found:');
    console.table(rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

verifySuperAdmin();
