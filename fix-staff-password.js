const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixStaffPassword() {
  const connection = await mysql.createConnection({
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital'
  });

  try {
    // Check current password
    const [rows] = await connection.execute(
      'SELECT id, name, password_hash, role FROM users WHERE contact_number = ?',
      ['9876543213']
    );

    if (rows.length > 0) {
      const user = rows[0];
      console.log('Staff found:', user.name, user.role);
      console.log('Current password_hash:', user.password_hash);
      
      // Hash the correct password
      const hashedPassword = await bcrypt.hash('222222', 10);
      
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE contact_number = ?',
        [hashedPassword, '9876543213']
      );

      console.log('✅ Password fixed for staff 9876543213');
    } else {
      console.log('❌ Staff not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixStaffPassword();
