const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function checkTestUsers() {
  console.log('🔍 Checking test users in database...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check all users
    const [users] = await connection.execute(
      'SELECT id, user_id, name, email, contact_number, role, is_active FROM users ORDER BY role'
    );
    
    console.log('\n📋 All users in database:');
    console.log('=' * 50);
    
    users.forEach(user => {
      console.log(`ID: ${user.id} | Role: ${user.role} | Mobile: ${user.contact_number} | Email: ${user.email} | Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`   Name: ${user.name} | User ID: ${user.user_id}`);
      console.log('-'.repeat(50));
    });
    
    // Check specific test credentials
    console.log('\n🧪 Testing specific credentials:');
    const testCredentials = [
      { mobile: '9876543210', role: 'super-admin' },
      { mobile: '9876543211', role: 'admin' },
      { mobile: '9876543212', role: 'doctor' },
      { mobile: '9876543213', role: 'patient' }
    ];
    
    for (const cred of testCredentials) {
      const [result] = await connection.execute(
        'SELECT id, name, role, is_active FROM users WHERE contact_number = ?',
        [cred.mobile]
      );
      
      if (result.length > 0) {
        const user = result[0];
        console.log(`✅ ${cred.mobile} (${cred.role}): Found - ${user.name} (${user.role}) - Active: ${user.is_active ? 'Yes' : 'No'}`);
      } else {
        console.log(`❌ ${cred.mobile} (${cred.role}): Not found`);
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkTestUsers();
