const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createSuperAdmin() {
  const connection = await mysql.createConnection({
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital'
  });

  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await connection.execute(`
      INSERT INTO users (
        user_id, name, email, password_hash, role, 
        contact_number, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        password_hash = VALUES(password_hash),
        contact_number = VALUES(contact_number),
        updated_at = NOW()
    `, [
      'SA001',
      'Super Administrator', 
      'superadmin@hospital.com',
      hashedPassword,
      'super-admin',
      '9876543210',
      true
    ]);

    console.log('✅ Super Admin Created Successfully!');
    console.log('📱 Phone: 9876543210');
    console.log('🔑 Password: 123456');
    console.log('👤 Role: super-admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createSuperAdmin();
