// Create missing prescription tables
// Hospital Management System - Arogya Hospital

const { executeQuery } = require('../lib/mysql-connection.js');

async function createPrescriptionTables() {
  try {
    console.log('Creating missing prescription tables...');

    // 1. Create prescription_medications table
    console.log('Creating prescription_medications table...');
    const prescriptionMedicationsTable = `
      CREATE TABLE IF NOT EXISTS prescription_medications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prescription_id INT NOT NULL,
        medicine_id INT NOT NULL,
        medicine_name VARCHAR(100) NOT NULL,
        generic_name VARCHAR(100),
        strength VARCHAR(50),
        dosage_form VARCHAR(50),
        quantity INT NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        instructions TEXT,
        unit_price DECIMAL(10,2) DEFAULT 0,
        total_price DECIMAL(10,2) DEFAULT 0,
        is_dispensed BOOLEAN DEFAULT FALSE,
        dispensed_quantity INT DEFAULT 0,
        dispensed_by INT NULL,
        dispensed_at TIMESTAMP NULL,
        batch_number VARCHAR(50),
        expiry_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,
        FOREIGN KEY (dispensed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_prescription_id (prescription_id),
        INDEX idx_medicine_id (medicine_id),
        INDEX idx_is_dispensed (is_dispensed),
        INDEX idx_dispensed_at (dispensed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await executeQuery(prescriptionMedicationsTable);
    console.log('✅ prescription_medications table created');

    // 2. Create prescription_dispensing_log table for audit trail
    console.log('Creating prescription_dispensing_log table...');
    const dispensingLogTable = `
      CREATE TABLE IF NOT EXISTS prescription_dispensing_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        log_id VARCHAR(50) UNIQUE NOT NULL,
        prescription_id INT NOT NULL,
        prescription_medication_id INT NOT NULL,
        action ENUM('DISPENSED', 'PARTIAL_DISPENSED', 'RETURNED', 'CANCELLED') NOT NULL,
        quantity INT NOT NULL,
        batch_number VARCHAR(50),
        expiry_date DATE,
        unit_price DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        dispensed_by INT NOT NULL,
        patient_signature TEXT,
        pharmacist_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
        FOREIGN KEY (prescription_medication_id) REFERENCES prescription_medications(id) ON DELETE CASCADE,
        FOREIGN KEY (dispensed_by) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_prescription_id (prescription_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await executeQuery(dispensingLogTable);
    console.log('✅ prescription_dispensing_log table created');

    // 3. Check if prescriptions table exists and has proper structure
    console.log('Checking prescriptions table structure...');
    try {
      const prescriptionsCheck = await executeQuery('DESCRIBE prescriptions');
      console.log('✅ prescriptions table exists');
      
      // Check if it has all required columns
      const columns = prescriptionsCheck.map(row => row.Field);
      const requiredColumns = ['prescription_id', 'patient_id', 'doctor_id', 'prescription_date', 'status', 'total_amount'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('Adding missing columns to prescriptions table...');
        
        for (const column of missingColumns) {
          let alterQuery = '';
          switch (column) {
            case 'prescription_id':
              alterQuery = 'ALTER TABLE prescriptions ADD COLUMN prescription_id VARCHAR(50) UNIQUE';
              break;
            case 'prescription_date':
              alterQuery = 'ALTER TABLE prescriptions ADD COLUMN prescription_date DATE DEFAULT (CURDATE())';
              break;
            case 'status':
              alterQuery = "ALTER TABLE prescriptions ADD COLUMN status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'active'";
              break;
            case 'total_amount':
              alterQuery = 'ALTER TABLE prescriptions ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0';
              break;
          }
          
          if (alterQuery) {
            try {
              await executeQuery(alterQuery);
              console.log(`✅ Added column: ${column}`);
            } catch (err) {
              console.log(`⚠️  Column ${column} might already exist or error: ${err.message}`);
            }
          }
        }
      }
      
    } catch (error) {
      console.log('Creating prescriptions table...');
      const prescriptionsTable = `
        CREATE TABLE IF NOT EXISTS prescriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          prescription_id VARCHAR(50) UNIQUE NOT NULL,
          patient_id INT NOT NULL,
          doctor_id INT NOT NULL,
          prescription_date DATE NOT NULL DEFAULT (CURDATE()),
          diagnosis TEXT,
          symptoms TEXT,
          vital_signs JSON,
          allergies TEXT,
          status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'active',
          total_amount DECIMAL(10,2) DEFAULT 0,
          notes TEXT,
          follow_up_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
          FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE RESTRICT,
          INDEX idx_prescription_id (prescription_id),
          INDEX idx_patient_id (patient_id),
          INDEX idx_doctor_id (doctor_id),
          INDEX idx_status (status),
          INDEX idx_prescription_date (prescription_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      
      await executeQuery(prescriptionsTable);
      console.log('✅ prescriptions table created');
    }

    // 4. Insert sample data for testing
    console.log('Inserting sample prescription data...');
    
    // Check if we have patients and doctors
    const patientsCheck = await executeQuery('SELECT id FROM patients LIMIT 1');
    const doctorsCheck = await executeQuery('SELECT id FROM users WHERE role = "doctor" LIMIT 1');
    const medicinesCheck = await executeQuery('SELECT id, name, generic_name, strength, dosage_form, unit_price FROM medicines LIMIT 2');
    
    if (patientsCheck.length > 0 && doctorsCheck.length > 0 && medicinesCheck.length > 0) {
      const patientId = patientsCheck[0].id;
      const doctorId = doctorsCheck[0].id;
      
      // Create sample prescription
      const prescriptionId = `RX${Date.now()}`;
      const samplePrescription = `
        INSERT IGNORE INTO prescriptions (
          prescription_id, patient_id, doctor_id, prescription_date, 
          diagnosis, status, total_amount, notes
        ) VALUES (
          '${prescriptionId}', ${patientId}, ${doctorId}, CURDATE(),
          'Common Cold with Fever', 'active', 150.00, 
          'Patient advised rest and plenty of fluids'
        )
      `;
      
      const prescriptionResult = await executeQuery(samplePrescription);
      const prescriptionDbId = prescriptionResult.insertId || 1;
      
      // Add sample medications to the prescription
      for (let i = 0; i < Math.min(2, medicinesCheck.length); i++) {
        const medicine = medicinesCheck[i];
        const sampleMedication = `
          INSERT IGNORE INTO prescription_medications (
            prescription_id, medicine_id, medicine_name, generic_name, 
            strength, dosage_form, quantity, dosage, frequency, duration,
            instructions, unit_price, total_price, is_dispensed
          ) VALUES (
            ${prescriptionDbId}, ${medicine.id}, '${medicine.name}', '${medicine.generic_name || medicine.name}',
            '${medicine.strength || '500mg'}', '${medicine.dosage_form || 'tablet'}', 
            ${i === 0 ? 10 : 20}, '${i === 0 ? '1 tablet' : '2 tablets'}', 
            '${i === 0 ? 'Twice daily' : 'Three times daily'}', '${i === 0 ? '5 days' : '7 days'}',
            '${i === 0 ? 'Take after meals' : 'Take before meals'}', 
            ${medicine.unit_price || 5.00}, ${i === 0 ? 50.00 : 100.00}, 
            ${i === 0 ? 0 : 1}
          )
        `;
        
        await executeQuery(sampleMedication);
      }
      
      console.log('✅ Sample prescription data inserted');
    } else {
      console.log('⚠️  Skipping sample data - missing patients, doctors, or medicines');
    }

    console.log('\n🎉 All prescription tables created successfully!');
    
    // Verify tables were created
    const tables = await executeQuery('SHOW TABLES');
    console.log('\n📋 Current database tables:');
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      if (tableName.includes('prescription')) {
        console.log(`✅ ${tableName}`);
      }
    });

  } catch (error) {
    console.error('❌ Error creating prescription tables:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createPrescriptionTables();
