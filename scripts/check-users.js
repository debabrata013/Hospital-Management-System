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

async function checkUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check all users
    console.log('📊 All Users:');
    const [users] = await connection.execute(`
      SELECT id, user_id, name, email, role, department, specialization, is_active
      FROM users
      ORDER BY role, name
    `);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      Object.entries(user).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    });

    // Check patients
    console.log('\n📊 Patients:');
    const [patients] = await connection.execute(`
      SELECT id, name, patient_id, is_active
      FROM patients
      ORDER BY name
      LIMIT 5
    `);
    
    patients.forEach((patient, index) => {
      console.log(`\nPatient ${index + 1}:`);
      Object.entries(patient).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    });

    console.log('\n🎉 Users check completed!');
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

checkUsers();
