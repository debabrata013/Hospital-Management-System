const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testDoctorsAPI() {
  let connection;
  
  try {
    console.log('Testing doctors API functionality...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('Connected to database successfully!');

    // Test the same query as the API
    console.log('\n=== Testing doctors query ===');
    const [doctors] = await connection.execute(`
      SELECT 
        id,
        name,
        email,
        specialization,
        department,
        qualification,
        experience_years,
        license_number,
        employee_id,
        is_active
      FROM users 
      WHERE role = 'doctor' 
      AND is_active = 1
      ORDER BY name ASC
    `);
    
    console.log(`Found ${doctors.length} active doctors:`);
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} - ${doctor.specialization || 'General Medicine'} (${doctor.department || 'General'})`);
    });

    if (doctors.length === 0) {
      console.log('\n⚠️  No active doctors found in the database!');
      console.log('   Make sure you have doctors with role="doctor" and is_active=1');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDoctorsAPI();