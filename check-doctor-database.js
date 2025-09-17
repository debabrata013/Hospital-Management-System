const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkDoctorData() {
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

    // Check for doctors in users table
    console.log('\n=== Checking doctors in users table ===');
    const [doctors] = await connection.execute(
      "SELECT id, name, email, role, is_active FROM users WHERE role = 'doctor' LIMIT 5"
    );
    
    console.log('Found doctors:', JSON.stringify(doctors, null, 2));

    if (doctors.length > 0) {
      const doctorId = doctors[0].id;
      
      // Check staff_profiles for this doctor
      console.log(`\n=== Checking staff_profiles for doctor ID ${doctorId} ===`);
      const [profiles] = await connection.execute(
        "SELECT * FROM staff_profiles WHERE user_id = ?",
        [doctorId]
      );
      
      console.log('Staff profile:', JSON.stringify(profiles, null, 2));

      // Test the full query from the API
      console.log(`\n=== Testing full API query for doctor ID ${doctorId} ===`);
      const [fullDetails] = await connection.execute(`
        SELECT 
          u.id,
          u.name as doctor_name,
          u.email,
          u.role,
          sp.contact_number,
          sp.specialization,
          sp.qualifications,
          sp.experience_years,
          sp.license_number,
          sp.department,
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
        LEFT JOIN staff_profiles sp ON u.id = sp.user_id
        WHERE u.id = ?
        AND u.role = 'doctor'
        LIMIT 1
      `, [doctorId]);
      
      console.log('Full doctor details:', JSON.stringify(fullDetails, null, 2));
      
      // Check recent patients
      console.log(`\n=== Checking recent patients for doctor ID ${doctorId} ===`);
      const [patients] = await connection.execute(`
        SELECT 
          p.id as patient_id,
          p.name as patient_name,
          a.admission_date,
          a.diagnosis,
          a.chief_complaint,
          r.room_number
        FROM patients p
        JOIN admissions a ON p.id = a.patient_id
        LEFT JOIN rooms r ON a.room_id = r.id
        WHERE a.doctor_id = ?
        AND a.status = 'active'
        AND p.is_active = 1
        ORDER BY a.admission_date DESC
        LIMIT 5
      `, [doctorId]);
      
      console.log('Recent patients:', JSON.stringify(patients, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDoctorData();