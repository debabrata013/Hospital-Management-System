const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function fixReceptionistLogin() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check user with mobile 9876543215
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE contact_number = ?',
      ['9876543215']
    );
    
    if (users.length === 0) {
      console.log('❌ No user found with mobile 9876543215');
      return;
    }
    
    const user = users[0];
    console.log(`👤 Found user: ${user.name} (${user.role})`);
    
    // Fix password to 444444
    const hashedPassword = await bcrypt.hash('444444', 10);
    
    await connection.execute(
      'UPDATE users SET password_hash = ?, role = ?, is_active = 1 WHERE id = ?',
      [hashedPassword, 'receptionist', user.id]
    );
    
    console.log('✅ Fixed user credentials');
    console.log('   Mobile: 9876543215');
    console.log('   Password: 444444');
    console.log('   Role: receptionist');
    console.log('   Status: Active');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixReceptionistLogin();
