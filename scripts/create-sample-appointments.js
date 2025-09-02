require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function createSampleAppointments() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Creating sample appointments...');

    // Get available patients
    const [patients] = await connection.execute(`
      SELECT id, name, patient_id 
      FROM patients 
      WHERE is_active = 1 
      ORDER BY id 
      LIMIT 10
    `);

    if (patients.length === 0) {
      console.log('❌ No patients found. Please add patients first.');
      return;
    }

    // Get available doctors (just basic user info)
    const [doctors] = await connection.execute(`
      SELECT u.id, u.name, u.email
      FROM users u
      WHERE u.role = 'doctor' AND u.is_active = 1
      ORDER BY u.id
      LIMIT 5
    `);

    if (doctors.length === 0) {
      console.log('❌ No doctors found. Please add doctors first.');
      return;
    }

    console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);

    // Get the next appointment ID
    const [lastAppointment] = await connection.execute(`
      SELECT appointment_id FROM appointments ORDER BY id DESC LIMIT 1
    `);

    let nextId = 1;
    if (lastAppointment.length > 0) {
      const lastIdStr = lastAppointment[0].appointment_id;
      const match = lastIdStr.match(/APT(\d+)/);
      if (match && !isNaN(parseInt(match[1]))) {
        nextId = parseInt(match[1]) + 1;
      } else {
        // If we can't parse the last ID, find the highest valid ID
        const [allAppointments] = await connection.execute(`
          SELECT appointment_id FROM appointments WHERE appointment_id REGEXP '^APT[0-9]+$' ORDER BY appointment_id DESC LIMIT 1
        `);
        if (allAppointments.length > 0) {
          const validMatch = allAppointments[0].appointment_id.match(/APT(\d+)/);
          if (validMatch) {
            nextId = parseInt(validMatch[1]) + 1;
          }
        }
      }
    }

    // Appointment types (matching the enum values)
    const appointmentTypes = [
      'consultation',
      'follow-up',
      'emergency',
      'routine-checkup',
      'procedure',
      'vaccination',
      'counseling'
    ];

    // Visit types
    const visitTypes = [
      'first-visit',
      'follow-up',
      'routine',
      'emergency'
    ];

    // Priorities
    const priorities = [
      'low',
      'medium',
      'high',
      'urgent'
    ];

    // Statuses
    const statuses = [
      'scheduled',
      'confirmed',
      'in-progress',
      'completed',
      'cancelled',
      'no-show',
      'rescheduled'
    ];

    // Generate sample appointments for the next 30 days
    const sampleAppointments = [];
    const today = new Date();
    
    for (let i = 0; i < 20; i++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
      
      const hours = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      
      const appointmentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
      const visitType = visitTypes[Math.floor(Math.random() * visitTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const appointmentId = `APT${nextId.toString().padStart(3, '0')}`;
      nextId++;

      sampleAppointments.push({
        appointment_id: appointmentId,
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: appointmentDate.toISOString().split('T')[0],
        appointment_time: appointmentTime,
        duration: 30,
        appointment_type: appointmentType,
        visit_type: visitType,
        priority: priority,
        status: status,
        reason_for_visit: `Sample appointment for ${patient.name} with Dr. ${doctor.name}`,
        consultation_fee: Math.floor(Math.random() * 500) + 100
      });
    }

    // Insert sample appointments
    for (const appointment of sampleAppointments) {
      await connection.execute(`
        INSERT INTO appointments (
          appointment_id, patient_id, doctor_id, appointment_date, appointment_time, 
          duration, appointment_type, visit_type, priority, status, reason_for_visit, consultation_fee
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        appointment.appointment_id,
        appointment.patient_id,
        appointment.doctor_id,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.duration,
        appointment.appointment_type,
        appointment.visit_type,
        appointment.priority,
        appointment.status,
        appointment.reason_for_visit,
        appointment.consultation_fee
      ]);
    }

    console.log(`✅ Created ${sampleAppointments.length} sample appointments`);

    // Show some statistics
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
      FROM appointments
    `);

    console.log('\n📊 Appointment Statistics:');
    console.log(`Total appointments: ${stats[0].total}`);
    console.log(`Scheduled: ${stats[0].scheduled}`);
    console.log(`Confirmed: ${stats[0].confirmed}`);
    console.log(`Completed: ${stats[0].completed}`);
    console.log(`Cancelled: ${stats[0].cancelled}`);

    // Show today's appointments
    const [todayAppointments] = await connection.execute(`
      SELECT 
        a.appointment_time,
        p.name as patient_name,
        u.name as doctor_name,
        a.appointment_type,
        a.status
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON a.doctor_id = u.id
      WHERE a.appointment_date = CURDATE()
      ORDER BY a.appointment_time
    `);

    if (todayAppointments.length > 0) {
      console.log('\n📅 Today\'s Appointments:');
      todayAppointments.forEach(apt => {
        console.log(`${apt.appointment_time} - ${apt.patient_name} with Dr. ${apt.doctor_name} (${apt.appointment_type}) - ${apt.status}`);
      });
    } else {
      console.log('\n📅 No appointments scheduled for today');
    }

  } catch (error) {
    console.error('❌ Error creating sample appointments:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createSampleAppointments()
  .then(() => {
    console.log('\n✅ Sample appointments created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Sample appointments creation failed:', error);
    process.exit(1);
  });
