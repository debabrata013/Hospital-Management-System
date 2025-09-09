const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkUser() {
  const connection = await mysql.createConnection({
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital'
  });

  try {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE contact_number = ?',
      ['9876543211']
    );

    if (rows.length > 0) {
      const user = rows[0];
      console.log('User found:', {
        id: user.id,
        name: user.name,
        contact_number: user.contact_number,
        role: user.role,
        is_active: user.is_active
      });
      
      // Test password
      const isValid = await bcrypt.compare('654321', user.password_hash);
      console.log('Password valid:', isValid);
    } else {
      console.log('User not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUser();
