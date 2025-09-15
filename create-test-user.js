const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function createTestUser() {
  console.log('👤 Creating test user for authentication testing...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Test user credentials
    const testUser = {
      user_id: 'TEST-ADMIN-001',
      name: 'Test Admin User',
      email: 'testadmin@hospital.com',
      contact_number: '9999999999',
      password: 'test123',
      role: 'admin',
      department: 'Administration'
    };
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Check if user already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE contact_number = ? OR email = ?',
      [testUser.contact_number, testUser.email]
    );
    
    if (existing.length > 0) {
      console.log('✅ Test user already exists');
      await connection.end();
      return testUser;
    }
    
    // Create the test user
    await connection.execute(
      `INSERT INTO users (
        user_id, name, email, contact_number, password_hash, 
        role, department, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        testUser.user_id,
        testUser.name,
        testUser.email,
        testUser.contact_number,
        hashedPassword,
        testUser.role,
        testUser.department
      ]
    );
    
    console.log('✅ Test user created successfully');
    console.log(`   Mobile: ${testUser.contact_number}`);
    console.log(`   Password: ${testUser.password}`);
    console.log(`   Role: ${testUser.role}`);
    
    await connection.end();
    return testUser;
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser().catch(console.error);
}

module.exports = createTestUser;
