const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'u15322997_Hospital'
};

async function addAppointmentsForDoctor22() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if doctor ID 22 exists
    const [doctor] = await connection.execute('SELECT * FROM users WHERE id = 22 AND role = "doctor"');
    if (doctor.length === 0) {
      console.log('❌ Doctor with ID 22 not found');
      return;
    }
    console.log('✅ Doctor found:', doctor[0].name);

    // Get some patients
    const [patients] = await connection.execute('SELECT id, name FROM patients LIMIT 5');
    if (patients.length === 0) {
      console.log('❌ No patients found');
      return;
    }
    console.log('✅ Found', patients.length, 'patients');

    // Get a receptionist for created_by
    const [receptionists] = await connection.execute('SELECT id FROM users WHERE role = "receptionist" LIMIT 1');
    const createdBy = receptionists.length > 0 ? receptionists[0].id : 22; // Use doctor as fallback

    // Sample appointments for today
    const appointments = [
      {
        appointment_id: `APT-${Date.now()}-1`,
        patient_id: patients[0].id,
        doctor_id: 22,
        appointment_date: todayStr,
        appointment_time: '09:30:00',
        appointment_type: 'consultation',
        visit_type: 'new',
        priority: 'normal',
        status: 'scheduled',
        reason_for_visit: 'Routine checkup',
        chief_complaint: 'General health checkup',
        consultation_fee: 500.00,
        created_by: createdBy
      },
      {
        appointment_id: `APT-${Date.now()}-2`,
        patient_id: patients[1] ? patients[1].id : patients[0].id,
        doctor_id: 22,
        appointment_date: todayStr,
        appointment_time: '10:15:00',
        appointment_type: 'consultation',
        visit_type: 'follow-up',
        priority: 'normal',
        status: 'scheduled',
        reason_for_visit: 'Follow-up consultation',
        chief_complaint: 'Follow-up on previous treatment',
        consultation_fee: 500.00,
        created_by: createdBy
      },
      {
        appointment_id: `APT-${Date.now()}-3`,
        patient_id: patients[2] ? patients[2].id : patients[0].id,
        doctor_id: 22,
        appointment_date: todayStr,
        appointment_time: '11:00:00',
        appointment_type: 'consultation',
        visit_type: 'new',
        priority: 'high',
        status: 'scheduled',
        reason_for_visit: 'Chest pain evaluation',
        chief_complaint: 'Chest pain and shortness of breath',
        consultation_fee: 500.00,
        created_by: createdBy
      }
    ];

    // Clear existing appointments for today for doctor 22
    await connection.execute(
      'DELETE FROM appointments WHERE doctor_id = ? AND appointment_date = ?',
      [22, todayStr]
    );

    // Insert new appointments
    for (const appointment of appointments) {
      const query = `
        INSERT INTO appointments (
          appointment_id, patient_id, doctor_id, appointment_date, appointment_time,
          appointment_type, visit_type, priority, status, reason_for_visit,
          chief_complaint, consultation_fee, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      await connection.execute(query, [
        appointment.appointment_id,
        appointment.patient_id,
        appointment.doctor_id,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.appointment_type,
        appointment.visit_type,
        appointment.priority,
        appointment.status,
        appointment.reason_for_visit,
        appointment.chief_complaint,
        appointment.consultation_fee,
        appointment.created_by
      ]);
    }

    console.log('✅ Today\'s appointments added successfully!');
    console.log(`📅 Added ${appointments.length} appointments for today (${todayStr})`);
    console.log('🏥 Appointments created for Doctor ID: 22');
    
    // Show created appointments
    const [createdAppointments] = await connection.execute(`
      SELECT a.*, p.name as patient_name, u.name as created_by_name, u.role as created_by_role
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.doctor_id = 22 AND a.appointment_date = ?
      ORDER BY a.appointment_time
    `, [todayStr]);

    console.log('\n📋 Created appointments:');
    createdAppointments.forEach(apt => {
      console.log(`   ${apt.appointment_time} - ${apt.patient_name} (${apt.status})`);
    });

  } catch (error) {
    console.error('❌ Error adding today\'s appointments:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addAppointmentsForDoctor22();
