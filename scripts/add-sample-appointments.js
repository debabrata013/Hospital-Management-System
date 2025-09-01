const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addSampleAppointments() {
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

    // Sample appointments for today
    const appointments = [
      {
        appointment_id: `APT-${Date.now()}-1`,
        doctor_id: 1, // Assuming doctor ID 1 exists
        patient_id: 1, // Assuming patient ID 1 exists
        appointment_date: `${todayStr} 09:30:00`,
        chief_complaint: 'Follow-up consultation for hypertension',
        status: 'scheduled',
        notes: 'Regular follow-up appointment',
        created_at: new Date()
      },
      {
        appointment_id: `APT-${Date.now()}-2`,
        doctor_id: 1,
        patient_id: 2,
        appointment_date: `${todayStr} 10:15:00`,
        chief_complaint: 'Chest pain evaluation',
        status: 'in_progress',
        notes: 'Patient reports chest discomfort',
        created_at: new Date()
      },
      {
        appointment_id: `APT-${Date.now()}-3`,
        doctor_id: 1,
        patient_id: 3,
        appointment_date: `${todayStr} 11:00:00`,
        chief_complaint: 'Routine cardiac check-up',
        status: 'waiting',
        notes: 'Scheduled cardiac monitoring',
        created_at: new Date()
      },
      {
        appointment_id: `APT-${Date.now()}-4`,
        doctor_id: 1,
        patient_id: 4,
        appointment_date: `${todayStr} 14:30:00`,
        chief_complaint: 'Emergency consultation',
        status: 'scheduled',
        notes: 'Urgent cardiac evaluation needed',
        created_at: new Date()
      }
    ];

    // Insert appointments
    for (const appointment of appointments) {
      const query = `
        INSERT INTO appointments (appointment_id, doctor_id, patient_id, appointment_date, chief_complaint, status, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await connection.execute(query, [
        appointment.appointment_id,
        appointment.doctor_id,
        appointment.patient_id,
        appointment.appointment_date,
        appointment.chief_complaint,
        appointment.status,
        appointment.notes,
        appointment.created_at
      ]);
    }

    console.log('✅ Sample appointments added successfully!');
    console.log(`📅 Added ${appointments.length} appointments for today (${todayStr})`);

  } catch (error) {
    console.error('❌ Error adding sample appointments:', error);
  } finally {
    await connection.end();
  }
}

addSampleAppointments();
