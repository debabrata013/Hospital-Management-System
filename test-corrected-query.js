const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testCorrectedQuery() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('Connected to database successfully!');

    // Test the corrected query for doctor ID 7
    const doctorId = 7;
    console.log(`\n=== Testing corrected API query for doctor ID ${doctorId} ===`);
    
    const [fullDetails] = await connection.execute(`
      SELECT 
        u.id,
        u.name as doctor_name,
        u.email,
        u.role,
        u.contact_number,
        u.specialization,
        u.qualification as qualifications,
        u.experience_years,
        u.license_number,
        u.department,
        u.employee_id,
        u.joining_date,
        u.address,
        u.date_of_birth,
        u.gender,
        u.is_active,
        CASE 
          WHEN u.is_active = 0 THEN 'Inactive'
          ELSE 'Active'  
        END as status,
        (
          SELECT COUNT(*)
          FROM admissions a
          WHERE a.doctor_id = u.id
          AND a.status = 'active'
        ) as admitted_patients,
        (
          SELECT COUNT(*)
          FROM appointments a
          WHERE a.doctor_id = u.id
          AND DATE(a.appointment_date) = CURDATE()
          AND a.status != 'Cancelled'
        ) as todays_appointments
      FROM users u
      WHERE u.id = ?
      AND u.role = 'doctor'
      LIMIT 1
    `, [doctorId]);
    
    console.log('Corrected doctor details:', JSON.stringify(fullDetails, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testCorrectedQuery();