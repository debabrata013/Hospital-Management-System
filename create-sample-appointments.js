const mysql = require('mysql2/promise');

async function createSampleAppointments() {
  console.log('🔍 CREATING SAMPLE APPOINTMENTS DATA\n');

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

    // First, let's check existing data
    console.log('\n2. Checking existing appointments...');
    const [existingAppointments] = await connection.execute('SELECT COUNT(*) as count FROM appointments');
    console.log(`   📊 Existing appointments: ${existingAppointments[0].count}`);

    // Check existing patients
    console.log('\n3. Checking existing patients...');
    const [existingPatients] = await connection.execute('SELECT id, firstName, lastName FROM patients LIMIT 5');
    console.log(`   📊 Existing patients: ${existingPatients.length}`);
    existingPatients.forEach(p => {
      console.log(`      ID: ${p.id}, Name: ${p.firstName} ${p.lastName}`);
    });

    // Create sample appointments for doctor_id = 1 (DR001)
    if (existingPatients.length > 0) {
      console.log('\n4. Creating sample appointments for doctor_id = 1...');
      
      const sampleAppointments = [
        {
          patient_id: existingPatients[0].id,
          doctor_id: 1,
          appointment_date: '2025-09-15',
          appointment_time: '10:00:00',
          status: 'completed',
          reason: 'Regular checkup'
        },
        {
          patient_id: existingPatients[1]?.id || existingPatients[0].id,
          doctor_id: 1,
          appointment_date: '2025-09-14',
          appointment_time: '11:30:00',
          status: 'completed',
          reason: 'Follow-up consultation'
        },
        {
          patient_id: existingPatients[2]?.id || existingPatients[0].id,
          doctor_id: 1,
          appointment_date: '2025-09-13',
          appointment_time: '14:00:00',
          status: 'completed',
          reason: 'Cardiology consultation'
        }
      ];

      for (const appointment of sampleAppointments) {
        try {
          await connection.execute(
            `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              appointment.patient_id,
              appointment.doctor_id,
              appointment.appointment_date,
              appointment.appointment_time,
              appointment.status,
              appointment.reason
            ]
          );
          console.log(`   ✅ Created appointment for patient ${appointment.patient_id}`);
        } catch (error) {
          console.log(`   ⚠️ Appointment may already exist for patient ${appointment.patient_id}`);
        }
      }
    }

    // Verify the created appointments
    console.log('\n5. Verifying created appointments...');
    const [newAppointments] = await connection.execute(
      'SELECT a.*, p.firstName, p.lastName FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.doctor_id = 1'
    );
    console.log(`   📊 Appointments for doctor_id = 1: ${newAppointments.length}`);
    newAppointments.forEach(apt => {
      console.log(`      Patient: ${apt.firstName} ${apt.lastName}, Date: ${apt.appointment_date}, Status: ${apt.status}`);
    });

    await connection.end();
    console.log('\n✅ Sample appointments creation completed');

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

createSampleAppointments();
