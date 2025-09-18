const mysql = require('mysql2/promise');

async function checkTableStructure() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: 'srv2047.hstgr.io',
      user: 'u153229971_admin',
      password: 'Admin!2025',
      database: 'u153229971_Hospital',
      port: 3306
    });

    console.log('✅ Connected to MySQL database');

    // Check if table exists
    console.log('🔍 Checking if nurse_schedules table exists...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'nurse_schedules'"
    );

    if (tables.length === 0) {
      console.log('❌ Table nurse_schedules does not exist!');
      console.log('\n📝 Please run this SQL to create the table:');
      console.log(`
CREATE TABLE nurse_schedules (
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
    FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE
);
      `);
      return;
    }

    console.log('✅ Table exists. Checking structure...');

    // Get table structure
    const [columns] = await connection.execute('DESCRIBE nurse_schedules');
    
    console.log('\n📋 Current table structure:');
    console.log('Column Name | Type | Null | Key | Default | Extra');
    console.log('------------|------|------|-----|---------|------');
    
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(11)} | ${col.Type.padEnd(4)} | ${col.Null.padEnd(4)} | ${col.Key.padEnd(3)} | ${(col.Default || 'NULL').toString().padEnd(7)} | ${col.Extra || ''}`);
    });

    // Check for specific columns we need
    const requiredColumns = [
      'nurse_id', 'shift_date', 'start_time', 'end_time', 
      'ward_assignment', 'shift_type', 'max_patients', 
      'current_patients', 'status'
    ];

    console.log('\n🔍 Checking required columns:');
    const existingColumns = columns.map(col => col.Field);
    
    requiredColumns.forEach(col => {
      const exists = existingColumns.includes(col);
      console.log(`   ${exists ? '✅' : '❌'} ${col}`);
    });

    // Suggest missing columns
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️  Missing columns detected!');
      console.log('📝 Run these SQL commands to add missing columns:');
      
      missingColumns.forEach(col => {
        switch(col) {
          case 'ward_assignment':
            console.log(`ALTER TABLE nurse_schedules ADD COLUMN ward_assignment VARCHAR(100) NOT NULL DEFAULT 'General Ward';`);
            break;
          case 'max_patients':
            console.log(`ALTER TABLE nurse_schedules ADD COLUMN max_patients INT DEFAULT 8;`);
            break;
          case 'current_patients':
            console.log(`ALTER TABLE nurse_schedules ADD COLUMN current_patients INT DEFAULT 0;`);
            break;
          case 'status':
            console.log(`ALTER TABLE nurse_schedules ADD COLUMN status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled';`);
            break;
        }
      });
    } else {
      console.log('\n🎉 All required columns exist!');
    }

  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the check
checkTableStructure().catch(console.error);