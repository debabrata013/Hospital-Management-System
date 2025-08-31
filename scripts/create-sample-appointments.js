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

async function createSampleAppointments() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Get some patients and doctors for sample data
    const [patients] = await connection.execute('SELECT id FROM patients WHERE is_active = 1 LIMIT 5');
    const [doctors] = await connection.execute(`
      SELECT s.id 
      FROM staff_profiles s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE u.role = 'doctor' AND u.is_active = 1 
      LIMIT 3
    `);
    
    if (patients.length === 0 || doctors.length === 0) {
      console.log('❌ No patients or doctors found. Please create some first.');
      return;
    }

    console.log(`📝 Found ${patients.length} patients and ${doctors.length} doctors`);

    // Check if we already have appointments
    const [existingAppointments] = await connection.execute('SELECT COUNT(*) as count FROM appointments');
    
    if (existingAppointments[0].count > 0) {
      console.log(`📊 Found ${existingAppointments[0].count} existing appointments. Skipping sample creation.`);
      return;
    }

    console.log('📝 Creating sample appointments...');
    
    const today = new Date();
    const sampleAppointments = [
      {
        appointment_id: 'APT001',
        patient_id: patients[0].id,
        doctor_id: doctors[0].id,
        appointment_date: today.toISOString().split('T')[0],
        appointment_time: '09:00:00',
        appointment_type: 'consultation',
        visit_type: 'first-visit',
        priority: 'medium',
        reason_for_visit: 'Follow-up for chest pain',
        status: 'confirmed'
      },
      {
        appointment_id: 'APT002',
        patient_id: patients[1]?.id || patients[0].id,
        doctor_id: doctors[1]?.id || doctors[0].id,
        appointment_date: today.toISOString().split('T')[0],
        appointment_time: '10:30:00',
        appointment_type: 'routine-checkup',
        visit_type: 'routine',
        priority: 'low',
        reason_for_visit: 'Routine pregnancy check-up',
        status: 'confirmed'
      },
      {
        appointment_id: 'APT003',
        patient_id: patients[2]?.id || patients[0].id,
        doctor_id: doctors[2]?.id || doctors[0].id,
        appointment_date: today.toISOString().split('T')[0],
        appointment_time: '14:00:00',
        appointment_type: 'follow-up',
        visit_type: 'follow-up',
        priority: 'medium',
        reason_for_visit: 'Diabetes management review',
        status: 'scheduled'
      },
      {
        appointment_id: 'APT004',
        patient_id: patients[3]?.id || patients[0].id,
        doctor_id: doctors[0].id,
        appointment_date: today.toISOString().split('T')[0],
        appointment_time: '16:30:00',
        appointment_type: 'procedure',
        visit_type: 'first-visit',
        priority: 'high',
        reason_for_visit: 'Knee replacement consultation',
        status: 'completed'
      },
      {
        appointment_id: 'APT005',
        patient_id: patients[0].id,
        doctor_id: doctors[1]?.id || doctors[0].id,
        appointment_date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        appointment_time: '11:00:00',
        appointment_type: 'emergency',
        visit_type: 'emergency',
        priority: 'urgent',
        reason_for_visit: 'Severe headache and nausea',
        status: 'scheduled'
      }
    ];

    for (const apt of sampleAppointments) {
      await connection.execute(`
        INSERT INTO appointments (
          appointment_id, patient_id, doctor_id, appointment_date, 
          appointment_time, appointment_type, visit_type, priority,
          reason_for_visit, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        apt.appointment_id, apt.patient_id, apt.doctor_id, apt.appointment_date,
        apt.appointment_time, apt.appointment_type, apt.visit_type, apt.priority,
        apt.reason_for_visit, apt.status
      ]);
      
      console.log(`✅ Created appointment ${apt.appointment_id}`);
    }
    
    console.log('🎉 Sample appointments created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample appointments:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createSampleAppointments();
