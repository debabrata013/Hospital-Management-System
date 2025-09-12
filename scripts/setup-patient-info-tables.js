const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupPatientInfoTables() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management'
    });

    console.log('Connected to database');

    // Create prescriptions table
    const createPrescriptionsTable = `
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id VARCHAR(50) NOT NULL,
        doctor_id INT NOT NULL,
        medications TEXT NOT NULL,
        dosage VARCHAR(255) NOT NULL,
        instructions TEXT NOT NULL,
        duration VARCHAR(100),
        status ENUM('active', 'completed', 'discontinued') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_patient_id (patient_id),
        INDEX idx_doctor_id (doctor_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Create AI content table
    const createAIContentTable = `
      CREATE TABLE IF NOT EXISTS ai_content (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id VARCHAR(50) NOT NULL,
        doctor_id INT NOT NULL,
        type ENUM('summary', 'diet_plan') NOT NULL,
        content TEXT NOT NULL,
        doctor_notes TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_patient_id (patient_id),
        INDEX idx_doctor_id (doctor_id),
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    // Execute table creation queries
    console.log('Creating prescriptions table...');
    await connection.execute(createPrescriptionsTable);
    console.log('✅ Prescriptions table created successfully');

    console.log('Creating AI content table...');
    await connection.execute(createAIContentTable);
    console.log('✅ AI content table created successfully');

    // Insert sample data for testing
    console.log('Inserting sample data...');
    
    // Sample prescriptions
    const samplePrescriptions = [
      {
        patient_id: 'P001',
        doctor_id: 1,
        medications: 'Amlodipine 5mg',
        dosage: '1 tablet daily',
        instructions: 'Take with food in the morning. Monitor blood pressure regularly.',
        duration: '30 days'
      },
      {
        patient_id: 'P001',
        doctor_id: 1,
        medications: 'Metoprolol 25mg',
        dosage: '1 tablet twice daily',
        instructions: 'Take morning and evening. Do not stop abruptly.',
        duration: '30 days'
      }
    ];

    for (const prescription of samplePrescriptions) {
      const insertPrescription = `
        INSERT INTO prescriptions (patient_id, doctor_id, medications, dosage, instructions, duration)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(insertPrescription, [
        prescription.patient_id,
        prescription.doctor_id,
        prescription.medications,
        prescription.dosage,
        prescription.instructions,
        prescription.duration
      ]);
    }

    // Sample AI content
    const sampleAIContent = [
      {
        patient_id: 'P001',
        doctor_id: 1,
        type: 'summary',
        content: 'Patient राजेश कुमार (P001) presented with chest discomfort during today\'s consultation. Clinical examination revealed elevated blood pressure (140/90 mmHg) but no signs of acute distress. Cardiovascular examination showed normal heart sounds, and respiratory examination revealed clear lung fields.\n\nCurrent management plan includes continuation of existing antihypertensive medications. The patient\'s symptoms appear to be related to his known hypertensive condition. No immediate intervention required, but close monitoring is recommended.\n\nRecommended follow-up appointment scheduled for one week to assess response to current treatment and monitor blood pressure control.',
        doctor_notes: '• Patient complains of chest discomfort\n• BP elevated at 140/90\n• No acute distress\n• Heart sounds normal\n• Lungs clear\n• Continue current medications\n• Follow up in 1 week',
        status: 'approved'
      },
      {
        patient_id: 'P001',
        doctor_id: 1,
        type: 'diet_plan',
        content: 'PERSONALIZED DIET PLAN FOR HYPERTENSION MANAGEMENT\n\nBREAKFAST (7:00-8:00 AM):\n• 1 bowl oatmeal with low-fat milk\n• 1 medium banana\n• 1 cup green tea (no sugar)\n• 4-5 almonds\n\nMID-MORNING SNACK (10:30 AM):\n• 1 small apple\n• 1 glass buttermilk (low salt)\n\nLUNCH (12:30-1:30 PM):\n• 2 rotis (whole wheat)\n• 1 cup dal (without tempering)\n• 1 cup mixed vegetables (steamed/boiled)\n• 1 small bowl brown rice\n• 1 glass water\n\nEVENING SNACK (4:00 PM):\n• 1 cup herbal tea\n• 2-3 dates\n• Handful of roasted chana\n\nDINNER (7:00-8:00 PM):\n• 2 rotis or 1 cup brown rice\n• 1 cup vegetable curry (minimal oil)\n• 1 bowl salad (cucumber, tomato, onion)\n• 1 glass warm water\n\nGENERAL GUIDELINES:\n• Limit salt intake to less than 2g per day\n• Avoid processed and packaged foods\n• Drink 8-10 glasses of water daily\n• Include 30 minutes of walking daily\n• Avoid alcohol and smoking',
        doctor_notes: '• Patient has hypertension\n• BMI slightly elevated\n• Needs low sodium diet\n• Regular exercise recommended\n• Monitor weight weekly',
        status: 'approved'
      }
    ];

    for (const content of sampleAIContent) {
      const insertAIContent = `
        INSERT INTO ai_content (patient_id, doctor_id, type, content, doctor_notes, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(insertAIContent, [
        content.patient_id,
        content.doctor_id,
        content.type,
        content.content,
        content.doctor_notes,
        content.status
      ]);
    }

    console.log('✅ Sample data inserted successfully');
    console.log('\n🎉 Patient Information System setup completed successfully!');
    console.log('\nTables created:');
    console.log('- prescriptions: Store patient prescriptions');
    console.log('- ai_content: Store AI-generated summaries and diet plans');
    console.log('\nYou can now use the Patient Information Center in the doctor dashboard.');

  } catch (error) {
    console.error('❌ Error setting up patient info tables:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupPatientInfoTables();
