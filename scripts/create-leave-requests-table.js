#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: 3306
};

async function createLeaveRequestsTable() {
  console.log('🗄️ Creating leave_requests table for Hospital Management System\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');

    // Create leave_requests table
    console.log('\n🔧 Creating leave_requests table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id VARCHAR(20) NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        leave_type ENUM('sick_leave', 'vacation', 'emergency', 'personal', 'conference', 'other') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        start_time TIME NULL,
        end_time TIME NULL,
        is_full_day BOOLEAN DEFAULT TRUE,
        reason TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
        approved_by VARCHAR(20) NULL,
        approved_at TIMESTAMP NULL,
        rejection_reason TEXT NULL,
        emergency_contact VARCHAR(15) NULL,
        replacement_doctor VARCHAR(20) NULL,
        replacement_doctor_name VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
        FOREIGN KEY (replacement_doctor) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_doctor_id (doctor_id),
        INDEX idx_status (status),
        INDEX idx_dates (start_date, end_date),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ leave_requests table created successfully');

    // Insert sample leave request for testing
    console.log('\n📝 Creating sample leave request...');
    const [existingLeave] = await connection.execute(
      'SELECT id FROM leave_requests WHERE doctor_id = "DR001" LIMIT 1'
    );

    if (existingLeave.length === 0) {
      await connection.execute(`
        INSERT INTO leave_requests (
          doctor_id, doctor_name, leave_type, start_date, end_date, 
          is_full_day, reason, status
        ) VALUES (
          'DR001', 'Dr. Rajesh Kumar', 'vacation', 
          DATE_ADD(CURDATE(), INTERVAL 7 DAY), 
          DATE_ADD(CURDATE(), INTERVAL 9 DAY),
          TRUE, 'Family vacation - pre-planned', 'pending'
        )
      `);
      console.log('✅ Sample leave request created');
    } else {
      console.log('✅ Sample leave request already exists');
    }

    // Show table structure
    console.log('\n📋 Leave requests table structure:');
    const [columns] = await connection.execute('DESCRIBE leave_requests');
    console.table(columns);

    // Show count
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM leave_requests');
    console.log(`\n📊 Total leave requests in database: ${count[0].count}`);

    await connection.end();
    console.log('\n🎉 Leave requests table setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup error:', error);
  }
}

// Run setup
createLeaveRequestsTable();
