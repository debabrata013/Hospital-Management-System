const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fixPassword() {
  const connection = await mysql.createConnection({
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital'
  });

  try {
    const hashedPassword = await bcrypt.hash('654321', 10);
    
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE contact_number = ?',
      [hashedPassword, '9876543211']
    );

    console.log('✅ Password updated for 9876543211');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixPassword();
