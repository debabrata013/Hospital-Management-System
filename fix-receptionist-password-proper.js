const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function fixReceptionistPassword() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Hash password using same method as registration
    const hashedPassword = await bcrypt.hash('444444', 10);
    
    // Update the user
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE contact_number = ?',
      [hashedPassword, '9876543215']
    );
    
    // Verify the update
    const [users] = await connection.execute(
      'SELECT id, name, contact_number, role, password_hash FROM users WHERE contact_number = ?',
      ['9876543215']
    );
    
    if (users.length > 0) {
      const user = users[0];
      const passwordMatch = await bcrypt.compare('444444', user.password_hash);
      
      console.log('✅ Password updated successfully!');
      console.log(`User: ${user.name} (${user.role})`);
      console.log(`Mobile: ${user.contact_number}`);
      console.log(`Password Test: ${passwordMatch ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixReceptionistPassword();
