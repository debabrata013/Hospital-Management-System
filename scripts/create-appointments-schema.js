require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function createAppointmentsSchema() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Setting up appointments system...');

    // Check if appointments table exists and has the correct structure
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'appointments'
    `, [dbConfig.database]);

    if (tables.length === 0) {
      console.log('Creating appointments table...');
      
      await connection.execute(`
        CREATE TABLE appointments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id INT NOT NULL,
          doctor_id INT NOT NULL,
          appointment_date DATE NOT NULL,
          appointment_time TIME NOT NULL,
          appointment_type VARCHAR(100) NOT NULL,
          status ENUM('Scheduled', 'Completed', 'Cancelled', 'No Show') NOT NULL DEFAULT 'Scheduled',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
          FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_patient_id (patient_id),
          INDEX idx_doctor_id (doctor_id),
          INDEX idx_appointment_date (appointment_date),
          INDEX idx_status (status)
        )
      `);
      
      console.log('✅ appointments table created');
    } else {
      console.log('✅ appointments table already exists');
    }

    // Check if we have doctors (users with role 'doctor')
    const [doctors] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM users u 
      JOIN staff_profiles sp ON u.id = sp.user_id 
      WHERE u.role = 'doctor'
    `);

    if (doctors[0].count === 0) {
      console.log('⚠️  No doctors found. Creating sample doctor...');
      
      // Create a sample doctor user
      const [userResult] = await connection.execute(`
        INSERT INTO users (name, email, password, role, is_active) 
        VALUES (?, ?, ?, ?, ?)
      `, ['Dr. John Smith', 'doctor.smith@hospital.com', 'hashed_password', 'doctor', 1]);
      
      const doctorId = userResult.insertId;
      
      // Create staff profile for the doctor
      await connection.execute(`
        INSERT INTO staff_profiles (user_id, department, specialization, contact_number, address, hire_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [doctorId, 'General Medicine', 'Internal Medicine', '+1234567890', '123 Hospital St', new Date()]);
      
      console.log('✅ Sample doctor created');
    } else {
      console.log(`✅ Found ${doctors[0].count} doctors`);
    }

    // Check if we have patients
    const [patients] = await connection.execute('SELECT COUNT(*) as count FROM patients WHERE is_active = 1');
    
    if (patients[0].count === 0) {
      console.log('⚠️  No active patients found. Please add patients first.');
    } else {
      console.log(`✅ Found ${patients[0].count} active patients`);
    }

    console.log('\n🎉 Appointments system setup completed!');
    console.log('\nNext steps:');
    console.log('1. Add patients if none exist');
    console.log('2. Add doctors if needed');
    console.log('3. Test appointment creation');

  } catch (error) {
    console.error('❌ Error setting up appointments system:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createAppointmentsSchema()
  .then(() => {
    console.log('\n✅ Appointments setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Appointments setup failed:', error);
    process.exit(1);
  });
