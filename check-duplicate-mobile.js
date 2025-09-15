const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function checkDuplicateMobile() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Find all users with mobile 9876543215
    const [users] = await connection.execute(
      'SELECT id, name, contact_number, role, is_active FROM users WHERE contact_number = ?',
      ['9876543215']
    );
    
    console.log(`📱 Users with mobile 9876543215: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id} | Name: ${user.name} | Role: ${user.role} | Active: ${user.is_active}`);
    });
    
    // Keep only the receptionist, deactivate others
    if (users.length > 1) {
      console.log('\n🔧 Fixing duplicate mobile numbers...');
      
      for (const user of users) {
        if (user.role === 'receptionist') {
          console.log(`✅ Keeping receptionist: ${user.name} (ID: ${user.id})`);
        } else {
          console.log(`❌ Deactivating: ${user.name} (${user.role}) (ID: ${user.id})`);
          await connection.execute(
            'UPDATE users SET is_active = 0 WHERE id = ?',
            [user.id]
          );
        }
      }
    }
    
    await connection.end();
    console.log('\n✅ Fixed duplicate mobile numbers');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDuplicateMobile();
