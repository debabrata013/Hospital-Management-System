const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function testLoginLogic() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const login = '9876543215';
    const password = '444444';
    
    console.log('🧪 Testing login logic...');
    console.log(`Login: ${login}`);
    console.log(`Password: ${password}`);
    
    // Same query as in login API
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE (contact_number = ? OR email = ?) AND is_active = 1',
      [login, login]
    );
    
    console.log(`\n📋 Query Results: ${users.length} users found`);
    
    if (users.length === 0) {
      console.log('❌ No user found');
      return;
    }
    
    const user = users[0];
    console.log(`User: ${user.name} (${user.role})`);
    console.log(`Active: ${user.is_active}`);
    console.log(`Password Hash: ${user.password_hash ? 'Present' : 'Missing'}`);
    
    // Test password comparison
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log(`Password Valid: ${isPasswordValid ? '✅ Yes' : '❌ No'}`);
    
    if (isPasswordValid) {
      console.log('\n🎉 LOGIN SHOULD WORK!');
      console.log('The API should return success for these credentials.');
    } else {
      console.log('\n❌ LOGIN WILL FAIL!');
      console.log('Password comparison failed.');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLoginLogic();
