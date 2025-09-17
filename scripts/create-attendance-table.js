const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
};

async function createAttendanceTable() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent', 'late') NOT NULL,
        check_in TIME NULL,
        check_out TIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_attendance (user_id, date)
      );
    `;
    await connection.execute(createTableQuery);
    console.log('Successfully created attendance table.');
  } catch (error) {
    console.error('Error creating attendance table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAttendanceTable();
