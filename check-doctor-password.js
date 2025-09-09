const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkAndFixDoctor() {
  const connection = await mysql.createConnection({
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital'
  });

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE contact_number = ?',
      ['9876543212']
    );

    if (rows.length > 0) {
      const user = rows[0];
      console.log('Doctor found:', user.name, user.role);
      
      // Hash the password properly
      const hashedPassword = await bcrypt.hash('111111', 10);
      
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE contact_number = ?',
        [hashedPassword, '9876543212']
      );

      console.log('✅ Password fixed for doctor 9876543212');
    } else {
      console.log('Doctor not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAndFixDoctor();
