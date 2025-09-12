const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addTodayAppointments() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Check if doctor ID 1 exists
    const [doctors] = await connection.execute('SELECT id FROM users WHERE id = 1 AND role = "doctor"');
    if (doctors.length === 0) {
      console.log('❌ Doctor with ID 1 not found');
      return;
    }

    // Check if patients exist
    const [patients] = await connection.execute('SELECT id, name FROM patients LIMIT 5');
    if (patients.length === 0) {
      console.log('❌ No patients found. Please add patients first.');
      return;
    }

    // Get receptionist user for created_by field
    const [receptionists] = await connection.execute('SELECT id FROM users WHERE role = "receptionist" LIMIT 1');
    const createdBy = receptionists.length > 0 ? receptionists[0].id : 1;

    // Sample appointments for today
    const appointments = [
      {
        appointment_id: `APT-${Date.now()}-1`,
        patient_id: patients[0].id,
        doctor_id: 1,
        appointment_date: todayStr,
        appointment_time: '09:30:00',
        appointment_type: 'consultation',
        visit_type: 'follow-up',
        priority: 'medium',
        status: 'scheduled',
        reason_for_visit: 'Follow-up consultation for hypertension',
        chief_complaint: 'Blood pressure monitoring and medication review',
        consultation_fee: 500.00,
        created_by: createdBy
      },
      {
        appointment_id: `APT-${Date.now()}-2`,
        patient_id: patients[1] ? patients[1].id : patients[0].id,
        doctor_id: 1,
        appointment_date: todayStr,
        appointment_time: '10:15:00',
        appointment_type: 'consultation',
        visit_type: 'first-visit',
        priority: 'high',
        status: 'confirmed',
        reason_for_visit: 'Chest pain evaluation',
        chief_complaint: 'Patient reports chest discomfort and shortness of breath',
        consultation_fee: 500.00,
        created_by: createdBy
      },
      {
        appointment_id: `APT-${Date.now()}-3`,
        patient_id: patients[2] ? patients[2].id : patients[0].id,
        doctor_id: 1,
        appointment_date: todayStr,
        appointment_time: '11:00:00',
        appointment_type: 'routine-checkup',
        visit_type: 'routine',
        priority: 'low',
        status: 'scheduled',
        reason_for_visit: 'Routine cardiac check-up',
        chief_complaint: 'Annual cardiac health assessment',
        consultation_fee: 300.00,
        created_by: createdBy
      },
      {
        appointment_id: `APT-${Date.now()}-4`,
        patient_id: patients[3] ? patients[3].id : patients[0].id,
        doctor_id: 1,
        appointment_date: todayStr,
        appointment_time: '14:30:00',
        appointment_type: 'emergency',
        visit_type: 'emergency',
        priority: 'urgent',
        status: 'confirmed',
        reason_for_visit: 'Emergency consultation',
        chief_complaint: 'Severe chest pain with radiating symptoms',
        consultation_fee: 800.00,
        created_by: createdBy
      },
      {
        appointment_id: `APT-${Date.now()}-5`,
        patient_id: patients[4] ? patients[4].id : patients[0].id,
        doctor_id: 1,
        appointment_date: todayStr,
        appointment_time: '16:00:00',
        appointment_type: 'follow-up',
        visit_type: 'follow-up',
        priority: 'medium',
        status: 'scheduled',
        reason_for_visit: 'Post-surgery follow-up',
        chief_complaint: 'Recovery assessment after cardiac procedure',
        consultation_fee: 400.00,
        created_by: createdBy
      }
    ];

    // Clear existing appointments for today for this doctor
    await connection.execute(
      'DELETE FROM appointments WHERE doctor_id = ? AND appointment_date = ?',
      [1, todayStr]
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
    console.log('🏥 Appointments created for Doctor ID: 1');
    
    // Show created appointments
    const [createdAppointments] = await connection.execute(`
      SELECT a.*, p.name as patient_name, u.name as created_by_name, u.role as created_by_role
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.doctor_id = 1 AND a.appointment_date = ?
      ORDER BY a.appointment_time
    `, [todayStr]);

    console.log('\n📋 Created Appointments:');
    createdAppointments.forEach(apt => {
      console.log(`  • ${apt.appointment_time} - ${apt.patient_name} (${apt.appointment_type}) - ${apt.status}`);
      console.log(`    Created by: ${apt.created_by_name} (${apt.created_by_role})`);
    });

  } catch (error) {
    console.error('❌ Error adding today\'s appointments:', error);
  } finally {
    await connection.end();
  }
}

addTodayAppointments();
