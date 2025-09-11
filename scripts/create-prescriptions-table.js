const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createPrescriptionsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Creating prescriptions table...');

    // Check if table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'prescriptions'
    `, [process.env.DB_NAME]);

    if (tables.length === 0) {
      // Create prescriptions table
      await connection.execute(`
        CREATE TABLE prescriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          prescription_id VARCHAR(50) UNIQUE NOT NULL,
          patient_id INT NOT NULL,
          doctor_id INT NOT NULL,
          appointment_id INT NULL,
          blood_pressure VARCHAR(20) NULL,
          heart_rate VARCHAR(10) NULL,
          temperature VARCHAR(10) NULL,
          weight VARCHAR(10) NULL,
          height VARCHAR(10) NULL,
          medicines JSON NOT NULL,
          remarks TEXT NULL,
          prescription_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
          FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
          INDEX idx_patient_id (patient_id),
          INDEX idx_doctor_id (doctor_id),
          INDEX idx_prescription_date (prescription_date)
        )
      `);
      
      console.log('✅ Prescriptions table created successfully!');
    } else {
      console.log('✅ Prescriptions table already exists');
    }

    // Add some sample data if table is empty
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM prescriptions');
    if (count[0].count === 0) {
      console.log('Adding sample prescription data...');
      
      // Get sample patient and doctor
      const [patients] = await connection.execute('SELECT id FROM patients LIMIT 1');
      const [doctors] = await connection.execute('SELECT id FROM users WHERE role = "doctor" LIMIT 1');
      
      if (patients.length > 0 && doctors.length > 0) {
        const sampleMedicines = [
          { name: 'Paracetamol', dosage: '500mg', frequency: '2 times daily', duration: '5 days' },
          { name: 'Amoxicillin', dosage: '250mg', frequency: '3 times daily', duration: '7 days' }
        ];

        await connection.execute(`
          INSERT INTO prescriptions (
            prescription_id, patient_id, doctor_id, blood_pressure, heart_rate, 
            temperature, weight, height, medicines, remarks, prescription_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
        `, [
          'PRESC-SAMPLE-001',
          patients[0].id,
          doctors[0].id,
          '120/80',
          '72',
          '98.6',
          '70',
          '170',
          JSON.stringify(sampleMedicines),
          'Take medicines after meals. Follow up after 1 week.'
        ]);

        console.log('✅ Sample prescription data added');
      }
    }

    console.log('\n🎉 Prescriptions system setup completed!');

  } catch (error) {
    console.error('❌ Error setting up prescriptions table:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createPrescriptionsTable()
  .then(() => {
    console.log('\n✅ Prescriptions setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Prescriptions setup failed:', error);
    process.exit(1);
  });
