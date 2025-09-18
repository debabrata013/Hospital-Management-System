const mysql = require('mysql2/promise');

async function setupNurseSchedules() {
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

    if (tables.length > 0) {
      console.log('📋 Table already exists. Dropping and recreating...');
      await connection.execute('DROP TABLE nurse_schedules');
    }

    // Create nurse_schedules table
    console.log('🔨 Creating nurse_schedules table...');
    
    const createTableSQL = `
      CREATE TABLE nurse_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nurse_id INT NOT NULL,
        shift_type ENUM('Morning', 'Evening', 'Night') NOT NULL,
        shift_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        department VARCHAR(100) NOT NULL,
        notes TEXT,
        status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_nurse_shift (nurse_id, shift_date, shift_type)
      )
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Table created successfully');

    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    const sampleData = [
      [1, 'Morning', '2025-01-15', '06:00:00', '14:00:00', 'Emergency', 'Morning shift coverage'],
      [2, 'Evening', '2025-01-15', '14:00:00', '22:00:00', 'ICU', 'Evening ICU duty'],
      [1, 'Night', '2025-01-16', '22:00:00', '06:00:00', 'Emergency', 'Night emergency duty']
    ];

    const insertSQL = `
      INSERT INTO nurse_schedules 
      (nurse_id, shift_type, shift_date, start_time, end_time, department, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const data of sampleData) {
      try {
        await connection.execute(insertSQL, data);
        console.log(`   ✓ Added schedule for nurse ${data[0]} - ${data[1]} shift`);
      } catch (err) {
        console.log(`   ⚠️  Could not add sample data: ${err.message}`);
      }
    }

    // Verify the setup
    console.log('🔍 Verifying setup...');
    const [schedules] = await connection.execute('SELECT COUNT(*) as count FROM nurse_schedules');
    console.log(`✅ Setup complete! Found ${schedules[0].count} schedules in the table`);

    console.log('\n🎉 Nurse schedules table setup completed successfully!');
    console.log('You can now use the nurses schedules page in the admin panel.');

  } catch (error) {
    console.error('❌ Error setting up nurse schedules:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Database connection failed. Please check:');
      console.log('   - MySQL server is running');
      console.log('   - Database credentials are correct');
      console.log('   - Database "hospital_management" exists');
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      console.log('\n💡 Foreign key constraint failed. Make sure:');
      console.log('   - Users table exists with valid nurse records');
      console.log('   - Nurse IDs in sample data exist in users table');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupNurseSchedules().catch(console.error);