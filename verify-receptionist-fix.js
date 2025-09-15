const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function verifyReceptionistFix() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get user
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE contact_number = ?',
      ['9876543215']
    );
    
    const user = users[0];
    
    // Test password
    const passwordMatch = await bcrypt.compare('444444', user.password_hash);
    
    console.log('🔍 RECEPTIONIST LOGIN VERIFICATION');
    console.log('=' .repeat(40));
    console.log(`Mobile: 9876543215`);
    console.log(`Password: 444444`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.is_active ? '✅ Yes' : '❌ No'}`);
    console.log(`Password Valid: ${passwordMatch ? '✅ Yes' : '❌ No'}`);
    
    if (user.role === 'receptionist' && user.is_active && passwordMatch) {
      console.log('\n🎉 SUCCESS! Receptionist login should work now.');
      console.log('\n📝 Login Steps:');
      console.log('1. Go to: http://localhost:3000/login');
      console.log('2. Enter Mobile: 9876543215');
      console.log('3. Enter Password: 444444');
      console.log('4. Click Login');
      console.log('5. Should redirect to: /receptionist dashboard');
    } else {
      console.log('\n❌ ISSUE FOUND - Login may still fail');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyReceptionistFix();
