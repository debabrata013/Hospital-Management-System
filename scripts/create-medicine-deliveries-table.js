
const { executeQuery } = require('../lib/mysql-connection.js');

async function createMedicineDeliveriesTable() {
  try {
    console.log('Creating medicine_deliveries table...');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS medicine_deliveries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        medicine_id INT NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        route ENUM('Oral', 'IV', 'Injection', 'Other') NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        scheduled_time TIME NOT NULL,
        scheduled_date DATE NOT NULL,
        status ENUM('pending', 'delivered', 'missed', 'delayed') NOT NULL DEFAULT 'pending',
        prescribed_by INT NOT NULL,
        notes TEXT,
        priority ENUM('high', 'normal', 'low') NOT NULL DEFAULT 'normal',
        delivered_at DATETIME,
        delivered_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
        FOREIGN KEY (prescribed_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (delivered_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_scheduled_date (scheduled_date),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await executeQuery(createTableQuery);
    console.log('✅ medicine_deliveries table created successfully!');

  } catch (error) {
    console.error('❌ Error creating medicine_deliveries table:', error);
  } finally {
    // process.exit(0); // Removed to allow Next.js to continue running
  }
}

createMedicineDeliveriesTable();
