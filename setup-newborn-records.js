#!/usr/bin/env node

/**
 * Setup script for Newborn Records feature
 * Run this script to set up the database table for newborn records
 *
 * Usage: node setup-newborn-records.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function setupNewbornRecords() {
  let connection;

  console.log('🩺 Setting up Newborn Records feature...');
  console.log('📊 Database: ' + dbConfig.database);
  console.log('🏥 Host: ' + dbConfig.host);

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Create newborn_records table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS newborn_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        record_id VARCHAR(20) NOT NULL UNIQUE,
        birth_date DATETIME NOT NULL,
        gender ENUM('male', 'female', 'other') NOT NULL,
        status ENUM('healthy', 'under_observation', 'critical', 'deceased') NOT NULL,
        weight_grams INT NOT NULL,
        mother_name VARCHAR(100),
        doctor_id INT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_doctor_id (doctor_id),
        INDEX idx_birth_date (birth_date),
        INDEX idx_gender (gender),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableQuery);
    console.log('✅ newborn_records table created successfully');

    // Insert sample data for testing (only if no records exist)
    const sampleData = [
      {
        record_id: 'NB001',
        birth_date: new Date('2024-01-15 10:30:00'),
        gender: 'male',
        status: 'healthy',
        weight_grams: 3200,
        mother_name: 'Sarah Johnson',
        doctor_id: 1,
        notes: 'Normal delivery, healthy baby boy'
      },
      {
        record_id: 'NB002',
        birth_date: new Date('2024-01-16 14:20:00'),
        gender: 'female',
        status: 'under_observation',
        weight_grams: 2800,
        mother_name: 'Priya Sharma',
        doctor_id: 1,
        notes: 'Baby under observation for jaundice'
      }
    ];

    console.log('📝 Inserting sample data...');
    for (const record of sampleData) {
      try {
        await connection.execute(`
          INSERT INTO newborn_records
          (record_id, birth_date, gender, status, weight_grams, mother_name, doctor_id, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          record.record_id,
          record.birth_date,
          record.gender,
          record.status,
          record.weight_grams,
          record.mother_name,
          record.doctor_id,
          record.notes
        ]);
        console.log(`✅ Sample record ${record.record_id} inserted`);
      } catch (insertError) {
        if (insertError.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Sample record ${record.record_id} already exists`);
        } else {
          console.error(`❌ Error inserting sample record ${record.record_id}:`, insertError.message);
        }
      }
    }

    console.log('🎉 Newborn Records feature setup completed successfully!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. The API endpoint is ready at /api/doctor/newborn-records');
    console.log('2. The page is available at /doctor/newborn-records');
    console.log('3. Only doctors with "Gynecology" department will see this feature');
    console.log('');
    console.log('🔗 Access the feature:');
    console.log('- Go to Doctor Dashboard');
    console.log('- Look for "Newborn Records" section (if you are in Gynecology department)');
    console.log('- Click "Manage Records" to start recording newborn babies');

  } catch (error) {
    console.error('❌ Error setting up newborn records:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure your .env.local file has correct database credentials');
    console.log('2. Ensure the database exists and is accessible');
    console.log('3. Check if the users table exists (for foreign key constraint)');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📄 Database connection closed');
    }
  }
}

// Run the setup
setupNewbornRecords();
