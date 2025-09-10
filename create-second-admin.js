const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createSecondAdmin() {
  const connection = await mysql.createConnection({
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital'
  });

  try {
    const hashedPassword = await bcrypt.hash('654321', 10);
    
    await connection.execute(`
      INSERT INTO users (
        user_id, name, email, password_hash, role, 
        contact_number, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'SA002',
      'Admin User', 
      'admin2@hospital.com',
      hashedPassword,
      'admin',
      '9876543211',
      true
    ]);

    console.log('✅ Second Admin Created!');
    console.log('📱 Phone: 9876543211');
    console.log('🔑 Password: 654321');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createSecondAdmin();
