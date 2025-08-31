const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function createAppointmentsSchema() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Create appointments table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id VARCHAR(20) UNIQUE NOT NULL,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        appointment_type ENUM('consultation', 'check-up', 'follow-up', 'surgery-consultation', 'emergency', 'routine') DEFAULT 'consultation',
        reason_for_visit TEXT,
        status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES staff_profiles(id) ON DELETE CASCADE,
        INDEX idx_appointment_date (appointment_date),
        INDEX idx_status (status),
        INDEX idx_doctor_id (doctor_id),
        INDEX idx_patient_id (patient_id)
      )
    `);
    console.log('✅ Appointments table created/verified');

    // Create appointment_reminders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointment_reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT NOT NULL,
        reminder_type ENUM('sms', 'email', 'push') DEFAULT 'sms',
        reminder_time TIMESTAMP NOT NULL,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Appointment reminders table created/verified');

    // Create appointment_types table for configuration
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointment_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type_name VARCHAR(100) NOT NULL,
        duration_minutes INT DEFAULT 30,
        color VARCHAR(7) DEFAULT '#3B82F6',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Appointment types table created/verified');

    // Insert default appointment types
    await connection.execute(`
      INSERT IGNORE INTO appointment_types (type_name, duration_minutes, color) VALUES
      ('consultation', 30, '#3B82F6'),
      ('check-up', 45, '#10B981'),
      ('follow-up', 20, '#8B5CF6'),
      ('surgery-consultation', 60, '#EF4444'),
      ('emergency', 15, '#F59E0B'),
      ('routine', 30, '#6B7280')
    `);
    console.log('✅ Default appointment types inserted');

    // Check if we have sample data
    const [existingAppointments] = await connection.execute('SELECT COUNT(*) as count FROM appointments');
    
    if (existingAppointments[0].count === 0) {
      console.log('📝 Creating sample appointments...');
      
      // Get some patients and doctors for sample data
      const [patients] = await connection.execute('SELECT id FROM patients LIMIT 5');
      const [doctors] = await connection.execute('SELECT id FROM staff_profiles WHERE role = "doctor" LIMIT 3');
      
      if (patients.length > 0 && doctors.length > 0) {
        const sampleAppointments = [
          {
            appointment_id: 'APT001',
            patient_id: patients[0].id,
            doctor_id: doctors[0].id,
            appointment_date: new Date().toISOString().split('T')[0],
            appointment_time: '09:00:00',
            appointment_type: 'consultation',
            reason_for_visit: 'Follow-up for chest pain',
            status: 'confirmed'
          },
          {
            appointment_id: 'APT002',
            patient_id: patients[1]?.id || patients[0].id,
            doctor_id: doctors[1]?.id || doctors[0].id,
            appointment_date: new Date().toISOString().split('T')[0],
            appointment_time: '10:30:00',
            appointment_type: 'check-up',
            reason_for_visit: 'Routine pregnancy check-up',
            status: 'confirmed'
          },
          {
            appointment_id: 'APT003',
            patient_id: patients[2]?.id || patients[0].id,
            doctor_id: doctors[2]?.id || doctors[0].id,
            appointment_date: new Date().toISOString().split('T')[0],
            appointment_time: '14:00:00',
            appointment_type: 'follow-up',
            reason_for_visit: 'Diabetes management review',
            status: 'scheduled'
          },
          {
            appointment_id: 'APT004',
            patient_id: patients[3]?.id || patients[0].id,
            doctor_id: doctors[0].id,
            appointment_date: new Date().toISOString().split('T')[0],
            appointment_time: '16:30:00',
            appointment_type: 'surgery-consultation',
            reason_for_visit: 'Knee replacement consultation',
            status: 'completed'
          }
        ];

        for (const apt of sampleAppointments) {
          await connection.execute(`
            INSERT INTO appointments (
              appointment_id, patient_id, doctor_id, appointment_date, 
              appointment_time, appointment_type, reason_for_visit, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            apt.appointment_id, apt.patient_id, apt.doctor_id, apt.appointment_date,
            apt.appointment_time, apt.appointment_type, apt.reason_for_visit, apt.status
          ]);
        }
        
        console.log('✅ Sample appointments created');
      }
    } else {
      console.log(`📊 Found ${existingAppointments[0].count} existing appointments`);
    }

    console.log('🎉 Appointments schema setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up appointments schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createAppointmentsSchema();
