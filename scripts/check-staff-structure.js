require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function checkStaffStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check staff_profiles table structure
    console.log('📋 Staff Profiles Table Structure:');
    const [staffColumns] = await connection.execute('DESCRIBE staff_profiles');
    staffColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Check users table structure
    console.log('\n📋 Users Table Structure:');
    const [userColumns] = await connection.execute('DESCRIBE users');
    userColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Check sample data
    console.log('\n📊 Sample Staff Data:');
    const [staffData] = await connection.execute(`
      SELECT s.*, u.name as user_name 
      FROM staff_profiles s 
      LEFT JOIN users u ON s.user_id = u.id 
      LIMIT 3
    `);
    
    staffData.forEach((staff, index) => {
      console.log(`\nStaff ${index + 1}:`);
      Object.entries(staff).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    });

    console.log('\n🎉 Staff structure check completed!');
    
  } catch (error) {
    console.error('❌ Error checking staff structure:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

checkStaffStructure();
