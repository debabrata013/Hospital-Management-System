const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function fixAdminPassword() {
  console.log('🔧 Fixing admin password for mobile: 9876543211');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check current user
    const [users] = await connection.execute(
      'SELECT id, name, contact_number, role, password_hash FROM users WHERE contact_number = ?',
      ['9876543211']
    );
    
    if (users.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = users[0];
    console.log(`📋 Found user: ${user.name} (${user.role})`);
    console.log(`📋 Current password hash: ${user.password_hash}`);
    
    // Hash the new password
    const newPassword = '654321';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log(`🔐 New password hash: ${hashedPassword}`);
    
    // Update password
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE contact_number = ?',
      [hashedPassword, '9876543211']
    );
    
    console.log('✅ Password updated successfully!');
    
    // Test the password
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`🧪 Password verification test: ${isValid ? 'PASS' : 'FAIL'}`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAdminPassword();
