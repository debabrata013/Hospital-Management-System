const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_db',
  port: process.env.DB_PORT || 3306,
};

async function createNurseAssignmentsTable() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Create nurse_assignments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS nurse_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nurse_id INT NOT NULL,
        doctor_id INT NOT NULL,
        department ENUM('opd', 'ward') NOT NULL,
        assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_nurse_id (nurse_id),
        INDEX idx_doctor_id (doctor_id),
        INDEX idx_department (department),
        UNIQUE KEY unique_active_assignment (nurse_id, is_active)
      )
    `);
    console.log('✅ nurse_assignments table created successfully');

    // Check if table was created
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'nurse_assignments'
    `);
    
    if (tables.length > 0) {
      console.log('✅ Table verification successful');
      
      // Show table structure
      const [columns] = await connection.execute(`
        DESCRIBE nurse_assignments
      `);
      
      console.log('\n📋 nurse_assignments table structure:');
      columns.forEach(col => {
        console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating nurse_assignments table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

createNurseAssignmentsTable();
