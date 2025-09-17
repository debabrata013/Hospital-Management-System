/**
 * Create Test Users Script
 * Creates test users for each role to enable proper authentication testing
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
};

const testUsers = [
  {
    user_id: 'SA001',
    name: 'Super Admin',
    email: 'admin@hospital.com',
    contact_number: '9999999999',
    role: 'super-admin',
    password: 'admin123',
    department: 'Administration',
    is_active: 1
  },
  {
    user_id: 'DR001',
    name: 'Dr. Test Doctor',
    email: 'doctor@hospital.com',
    contact_number: '9999999998',
    role: 'doctor',
    password: 'doctor123',
    specialization: 'General Medicine',
    is_active: 1
  },
  {
    user_id: 'NR001',
    name: 'Test Nurse',
    email: 'nurse@hospital.com',
    contact_number: '9876543210',
    role: 'nurse',
    password: 'nurse123',
    department: 'Nursing',
    is_active: 1
  },
  {
    user_id: 'RC001',
    name: 'Test Receptionist',
    email: 'reception@hospital.com',
    contact_number: '9999999997',
    role: 'receptionist',
    password: 'reception123',
    department: 'Reception',
    is_active: 1
  }
];

async function createTestUsers() {
  console.log('👥 Creating test users for production readiness...\n');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    for (const user of testUsers) {
      try {
        // Check if user already exists
        const [existing] = await connection.execute(
          'SELECT * FROM users WHERE user_id = ? OR email = ? OR contact_number = ?',
          [user.user_id, user.email, user.contact_number]
        );
        
        if (existing.length > 0) {
          console.log(`⚠️  User ${user.role} (${user.email}) already exists, skipping...`);
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Insert user
        await connection.execute(`
          INSERT INTO users (
            user_id, name, email, contact_number, role, password_hash, 
            department, specialization, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          user.user_id,
          user.name,
          user.email,
          user.contact_number,
          user.role,
          hashedPassword,
          user.department || null,
          user.specialization || null,
          user.is_active
        ]);
        
        console.log(`✅ Created ${user.role} user: ${user.email} (password: ${user.password})`);
        
      } catch (error) {
        console.error(`❌ Failed to create ${user.role} user:`, error.message);
      }
    }
    
    await connection.end();
    
    console.log('\n🎉 Test user creation completed!');
    console.log('\nTest Credentials:');
    console.log('================');
    testUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

createTestUsers().catch(console.error);
