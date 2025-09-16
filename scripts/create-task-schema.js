require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function createTaskSchema() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to the database.');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staff_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        task VARCHAR(255) NOT NULL,
        description TEXT,
        priority ENUM('high', 'normal', 'low') NOT NULL DEFAULT 'normal',
        due_time TIME,
        due_date DATE,
        status ENUM('pending', 'completed', 'overdue', 'in-progress') NOT NULL DEFAULT 'pending',
        assigned_by INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        category ENUM('vitals', 'medication', 'care', 'therapy', 'monitoring') NOT NULL,
        estimated_duration VARCHAR(50),
        completed_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ `staff_tasks` table created successfully.');

  } catch (error) {
    console.error('❌ Error creating task schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

createTaskSchema();
