const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function testLogin() {
  console.log('🧪 Testing admin login: 9876543211 / 654321');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const login = '9876543211';
    const password = '654321';
    
    // Check if login is mobile number
    const isMobileLogin = /^[6-9]\d{9}$/.test(login);
    console.log(`📱 Is mobile login: ${isMobileLogin}`);
    
    // Find user by mobile number
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE (contact_number = ? OR email = ?) AND is_active = 1',
      [login, login]
    );
    
    console.log(`👥 Users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ No user found');
      return;
    }
    
    const user = users[0];
    console.log(`📋 User found: ${user.name} (${user.role})`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`📱 Mobile: ${user.contact_number}`);
    console.log(`🔐 Password hash: ${user.password_hash}`);
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log(`🔓 Password valid: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      console.log('✅ LOGIN SUCCESS!');
      console.log(`🎯 User data:`, {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        mobile: user.contact_number,
        role: user.role,
        department: user.department || user.specialization
      });
    } else {
      console.log('❌ LOGIN FAILED - Invalid password');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
