const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function findRealUser() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get first active admin user
    const [users] = await connection.execute(
      'SELECT user_id, name, email, contact_number, role FROM users WHERE is_active = 1 AND role IN ("admin", "super-admin") LIMIT 5'
    );
    
    console.log('🔍 Available users for testing:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role})`);
      console.log(`   Mobile: ${user.contact_number}`);
      console.log(`   Email: ${user.email}`);
      console.log('');
    });
    
    await connection.end();
    
    if (users.length > 0) {
      return users[0];
    }
    
    return null;
    
  } catch (error) {
    console.error('Database error:', error.message);
    return null;
  }
}

findRealUser();
