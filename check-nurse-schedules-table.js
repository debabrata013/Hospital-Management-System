// Check the actual structure of nurse_schedules table
const mysql = require('mysql2/promise');

async function checkTableStructure() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u153229971_Hospital',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔍 Checking nurse_schedules table structure...\n');

    // Check if table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'nurse_schedules'"
    );

    if (tables.length === 0) {
      console.log('❌ Table nurse_schedules does not exist!');
      console.log('\n📋 You need to create the table using this SQL:');
      console.log(`
CREATE TABLE IF NOT EXISTS nurse_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nurse_id INT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    ward_assignment VARCHAR(100) NOT NULL,
    shift_type ENUM('Morning', 'Evening', 'Night') NOT NULL,
    max_patients INT DEFAULT 8,
    current_patients INT DEFAULT 0,
    status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_nurse_date (nurse_id, shift_date),
    INDEX idx_shift_date (shift_date),
    INDEX idx_status (status)
);
      `);
      return;
    }

    // Describe table structure
    const [columns] = await connection.execute(
      "DESCRIBE nurse_schedules"
    );

    console.log('✅ Table nurse_schedules exists!');
    console.log('\n📊 Current table structure:');
    console.log('┌─────────────────────┬─────────────────────┬──────┬─────┬─────────┬───────┐');
    console.log('│ Field               │ Type                │ Null │ Key │ Default │ Extra │');
    console.log('├─────────────────────┼─────────────────────┼──────┼─────┼─────────┼───────┤');
    
    columns.forEach(col => {
      const field = col.Field.padEnd(19);
      const type = col.Type.padEnd(19);
      const nullVal = col.Null.padEnd(4);
      const key = col.Key.padEnd(3);
      const defaultVal = (col.Default || '').toString().padEnd(7);
      const extra = col.Extra.padEnd(5);
      console.log(`│ ${field} │ ${type} │ ${nullVal} │ ${key} │ ${defaultVal} │ ${extra} │`);
    });
    console.log('└─────────────────────┴─────────────────────┴──────┴─────┴─────────┴───────┘');

    // Check for specific columns we need
    const columnNames = columns.map(col => col.Field);
    const requiredColumns = ['ward_assignment', 'max_patients', 'current_patients', 'status'];
    
    console.log('\n🔍 Checking required columns:');
    requiredColumns.forEach(col => {
      const exists = columnNames.includes(col);
      console.log(`   ${exists ? '✅' : '❌'} ${col}: ${exists ? 'EXISTS' : 'MISSING'}`);
    });

    // If ward_assignment is missing, suggest alternative columns
    if (!columnNames.includes('ward_assignment')) {
      console.log('\n💡 Alternative columns found:');
      const alternatives = columnNames.filter(col => 
        col.includes('ward') || col.includes('department') || col.includes('assignment')
      );
      if (alternatives.length > 0) {
        alternatives.forEach(alt => console.log(`   📍 ${alt}`));
      } else {
        console.log('   ⚠️  No alternative ward/department columns found');
      }
    }

    // Show sample data if any exists
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM nurse_schedules"
    );
    
    console.log(`\n📈 Records in table: ${rows[0].count}`);
    
    if (rows[0].count > 0) {
      const [sample] = await connection.execute(
        "SELECT * FROM nurse_schedules LIMIT 1"
      );
      console.log('\n📋 Sample record:');
      console.log(JSON.stringify(sample[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n📋 The nurse_schedules table does not exist. Create it with:');
      console.log('CREATE TABLE nurse_schedules (...);');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔐 Database connection failed. Check your credentials.');
    } else {
      console.log('\n🔧 Full error details:', error);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

checkTableStructure();
