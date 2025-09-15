const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function testReceptionistAccess() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get receptionist user
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE contact_number = ? AND role = ?',
      ['9876543215', 'receptionist']
    );
    
    if (users.length === 0) {
      console.log('❌ Receptionist user not found');
      return;
    }
    
    const user = users[0];
    console.log('✅ Receptionist user found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Mobile: ${user.contact_number}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
    console.log(`   Password Hash: ${user.password_hash ? 'Set' : 'Not Set'}`);
    
    await connection.end();
    
    console.log('\n📋 Login Instructions:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Enter Mobile: 9876543215');
    console.log('3. Enter Password: 444444');
    console.log('4. Should redirect to: /receptionist');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testReceptionistAccess();
