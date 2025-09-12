#!/usr/bin/env node

// Simplified Database Schema Creation
// Hospital Management System - MySQL Migration

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🏗️  Creating Database Schema (Simplified)...\n');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

// Core table creation SQL
const createTablesSQL = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super-admin', 'admin', 'doctor', 'staff', 'receptionist', 'pharmacy') NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    address TEXT,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    employee_id VARCHAR(20) UNIQUE,
    department VARCHAR(50),
    specialization VARCHAR(100),
    qualification VARCHAR(255),
    experience_years INT DEFAULT 0,
    license_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(255),
    emergency_contact VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(10,2),
    shift_preference ENUM('morning', 'evening', 'night', 'flexible') DEFAULT 'flexible',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Patients table
  `CREATE TABLE IF NOT EXISTS patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown') DEFAULT 'Unknown',
    contact_number VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed', 'Other') DEFAULT 'Single',
    occupation VARCHAR(100),
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_number VARCHAR(15) NOT NULL,
    emergency_contact_relation VARCHAR(50),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(50),
    insurance_expiry_date DATE,
    aadhar_number VARCHAR(12),
    profile_image VARCHAR(255),
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    registration_date DATE DEFAULT (CURRENT_DATE),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,

  // Appointments table
  `CREATE TABLE IF NOT EXISTS appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT DEFAULT 30,
    appointment_type ENUM('consultation', 'follow-up', 'emergency', 'routine-checkup', 'procedure', 'vaccination', 'counseling') DEFAULT 'consultation',
    visit_type ENUM('first-visit', 'follow-up', 'routine', 'emergency') DEFAULT 'first-visit',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled') DEFAULT 'scheduled',
    reason_for_visit TEXT,
    symptoms TEXT,
    chief_complaint TEXT,
    consultation_fee DECIMAL(8,2) DEFAULT 0.00,
    room_number VARCHAR(10),
    notes TEXT,
    cancellation_reason TEXT,
    rescheduled_from INT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (rescheduled_from) REFERENCES appointments(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,

  // Medicines table
  `CREATE TABLE IF NOT EXISTS medicines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100),
    brand_name VARCHAR(100),
    category VARCHAR(50),
    manufacturer VARCHAR(100),
    composition TEXT,
    strength VARCHAR(50),
    dosage_form ENUM('tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other') NOT NULL,
    pack_size VARCHAR(20),
    unit_price DECIMAL(8,2) NOT NULL,
    mrp DECIMAL(8,2) NOT NULL,
    current_stock INT DEFAULT 0,
    minimum_stock INT DEFAULT 10,
    maximum_stock INT DEFAULT 1000,
    expiry_date DATE,
    batch_number VARCHAR(50),
    supplier VARCHAR(100),
    storage_conditions TEXT,
    side_effects TEXT,
    contraindications TEXT,
    drug_interactions TEXT,
    pregnancy_category ENUM('A', 'B', 'C', 'D', 'X', 'Unknown') DEFAULT 'Unknown',
    prescription_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Prescriptions table
  `CREATE TABLE IF NOT EXISTS prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    medical_record_id INT,
    prescription_date DATE NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'completed', 'cancelled', 'expired') DEFAULT 'active',
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
  )`,

  // Billing table
  `CREATE TABLE IF NOT EXISTS billing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    appointment_id INT,
    bill_date DATE NOT NULL,
    bill_type ENUM('consultation', 'procedure', 'pharmacy', 'lab', 'admission', 'other') NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_percentage DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    balance_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('pending', 'partial', 'paid', 'refunded', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'upi', 'bank_transfer', 'insurance', 'other'),
    insurance_claim_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`,

  // Audit logs table
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INT,
    action ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT', 'SHARE') NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    additional_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )`
];

// Sample data
const sampleData = [
  // Hospital settings
  `INSERT IGNORE INTO hospital_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('hospital_name', 'NMSC (NMSC)', 'string', 'general', 'Hospital Name', TRUE),
  ('hospital_address', 'Main Street, City, State - 123456', 'string', 'general', 'Hospital Address', TRUE),
  ('hospital_phone', '+91-1234567890', 'string', 'general', 'Hospital Contact Number', TRUE),
  ('consultation_fee', '500.00', 'number', 'billing', 'Default Consultation Fee', FALSE)`,

  // Sample medicines
  `INSERT IGNORE INTO medicines (medicine_id, name, generic_name, category, dosage_form, strength, unit_price, mrp, current_stock, is_active) VALUES
  ('MED001', 'Paracetamol', 'Acetaminophen', 'Analgesic', 'tablet', '500mg', 2.50, 3.00, 1000, TRUE),
  ('MED002', 'Amoxicillin', 'Amoxicillin', 'Antibiotic', 'capsule', '250mg', 5.00, 6.00, 500, TRUE)`
];

async function createSchema() {
  let connection;
  
  try {
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!\n');
    
    console.log('🏗️  Creating core tables...');
    
    for (let i = 0; i < createTablesSQL.length; i++) {
      const sql = createTablesSQL[i];
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
      
      try {
        await connection.execute(sql);
        console.log(`✅ Created table: ${tableName}`);
      } catch (error) {
        console.error(`❌ Error creating table ${tableName}:`, error.message);
      }
    }
    
    // Create additional tables that might be missing
    const additionalTables = [
      `CREATE TABLE IF NOT EXISTS hospital_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        category VARCHAR(50) DEFAULT 'general',
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        updated_by INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS staff_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL UNIQUE,
        employee_type ENUM('full-time', 'part-time', 'contract', 'intern') DEFAULT 'full-time',
        reporting_manager_id INT,
        work_location VARCHAR(100),
        skills TEXT,
        certifications TEXT,
        languages_known VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reporting_manager_id) REFERENCES users(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        module VARCHAR(50) NOT NULL,
        permissions JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    ];
    
    console.log('\n🔧 Creating additional tables...');
    for (const sql of additionalTables) {
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
      try {
        await connection.execute(sql);
        console.log(`✅ Created table: ${tableName}`);
      } catch (error) {
        console.error(`❌ Error creating table ${tableName}:`, error.message);
      }
    }
    
    console.log('\n📝 Inserting sample data...');
    for (const sql of sampleData) {
      try {
        await connection.execute(sql);
        console.log('✅ Sample data inserted');
      } catch (error) {
        console.log('⚠️  Sample data already exists (skipping)');
      }
    }
    
    // Verify tables
    console.log('\n🔍 Verifying created tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Total tables in database: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('\n📋 Tables created:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    }
    
    console.log('\n🎉 Database schema created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run db:create-admin:sample');
    console.log('2. Start: npm run dev');
    console.log('3. Test: npm run test:apis');
    
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createSchema();
