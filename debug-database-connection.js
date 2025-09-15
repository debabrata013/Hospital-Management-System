const mysql = require('mysql2/promise');

async function debugDatabaseConnection() {
  console.log('🔍 DEBUGGING DATABASE CONNECTION AND APPOINTMENTS\n');

  const dbConfig = {
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital',
    port: 3306
  };

  try {
    console.log('1. Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('   ✅ Database connected successfully');

    // Check appointments table structure
    console.log('\n2. Checking appointments table structure...');
    const [columns] = await connection.execute('DESCRIBE appointments');
    console.log('   📋 Appointments table columns:');
    columns.forEach(col => {
      console.log(`      - ${col.Field}: ${col.Type}`);
    });

    // Check all appointments
    console.log('\n3. Checking all appointments...');
    const [appointments] = await connection.execute('SELECT * FROM appointments LIMIT 10');
    console.log(`   📊 Total appointments found: ${appointments.length}`);
    appointments.forEach(apt => {
      console.log(`      ID: ${apt.id}, Patient: ${apt.patient_id}, Doctor: ${apt.doctor_id}, Date: ${apt.appointment_date}`);
    });

    // Check patients table structure
    console.log('\n4. Checking patients table structure...');
    const [patientColumns] = await connection.execute('DESCRIBE patients');
    console.log('   📋 Patients table columns:');
    patientColumns.forEach(col => {
      console.log(`      - ${col.Field}: ${col.Type}`);
    });

    // Check some patients
    console.log('\n5. Checking patients...');
    const [patients] = await connection.execute('SELECT * FROM patients LIMIT 5');
    console.log(`   📊 Total patients found: ${patients.length}`);
    patients.forEach(patient => {
      console.log(`      ID: ${patient.id}, Name: ${patient.firstName} ${patient.lastName}`);
    });

    // Test the join query
    console.log('\n6. Testing join query with doctor_id = 1...');
    const [joinResult1] = await connection.execute(`
      SELECT 
        p.id,
        p.firstName,
        p.lastName,
        p.date_of_birth as dateOfBirth,
        MAX(a.appointment_date) as lastVisit,
        a.status,
        COUNT(DISTINCT a.id) as totalAppointments
      FROM patients p
      JOIN appointments a ON p.patient_id = p.id
      WHERE a.doctor_id = ?
      GROUP BY p.id, p.firstName, p.lastName, p.date_of_birth, a.status
      ORDER BY lastVisit DESC
    `, [1]);
    console.log(`   📊 Results for doctor_id = 1: ${joinResult1.length} patients`);

    // Test with doctor_id = 2
    console.log('\n7. Testing join query with doctor_id = 2...');
    const [joinResult2] = await connection.execute(`
      SELECT 
        p.id,
        p.firstName,
        p.lastName,
        p.date_of_birth as dateOfBirth,
        MAX(a.appointment_date) as lastVisit,
        a.status,
        COUNT(DISTINCT a.id) as totalAppointments
      FROM patients p
      JOIN appointments a ON p.patient_id = p.id
      WHERE a.doctor_id = ?
      GROUP BY p.id, p.firstName, p.lastName, p.date_of_birth, a.status
      ORDER BY lastVisit DESC
    `, [2]);
    console.log(`   📊 Results for doctor_id = 2: ${joinResult2.length} patients`);
    joinResult2.forEach(patient => {
      console.log(`      Patient: ${patient.firstName} ${patient.lastName}, Last Visit: ${patient.lastVisit}`);
    });

    await connection.end();
    console.log('\n✅ Database debugging completed');

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

debugDatabaseConnection();
