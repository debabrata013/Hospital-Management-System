const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function checkReceptionistUser() {
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
    console.log('👤 User Details:');
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Mobile: ${user.contact_number}`);
    console.log(`Role: ${user.role}`);
    console.log(`User ID: ${user.user_id}`);
    console.log(`Active: ${user.is_active ? 'Yes' : 'No'}`);
    
    // Test password
    const testPassword = '444444';
    const passwordMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`Password (${testPassword}): ${passwordMatch ? '✅ Correct' : '❌ Wrong'}`);
    
    // Fix password if wrong
    if (!passwordMatch) {
      console.log('\n🔧 Fixing password...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      
      console.log('✅ Password updated successfully');
    }
    
    // Ensure role is correct
    if (user.role !== 'receptionist') {
      console.log(`\n🔧 Fixing role from '${user.role}' to 'receptionist'...`);
      
      await connection.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        ['receptionist', user.id]
      );
      
      console.log('✅ Role updated successfully');
    }
    
    // Ensure user is active
    if (!user.is_active) {
      console.log('\n🔧 Activating user...');
      
      await connection.execute(
        'UPDATE users SET is_active = 1 WHERE id = ?',
        [user.id]
      );
      
      console.log('✅ User activated successfully');
    }
    
    await connection.end();
    console.log('\n✅ User is ready for login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkReceptionistUser();
