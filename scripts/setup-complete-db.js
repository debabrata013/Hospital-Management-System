require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function setupCompleteDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Create database if not exists
    await connection.execute('CREATE DATABASE IF NOT EXISTS hospital_management');
    console.log('✅ Database created/exists');
    
    // Use the database
    await connection.execute('USE hospital_management');
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist') NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role),
        INDEX idx_email (email)
      )
    `);
    console.log('✅ Users table created');

    // Create staff_profiles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staff_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        department VARCHAR(100),
        specialization VARCHAR(100),
        qualifications TEXT,
        experience_years INT,
        license_number VARCHAR(50),
        contact_number VARCHAR(20),
        address TEXT,
        hire_date DATE,
        shift_type ENUM('morning', 'evening', 'night', 'flexible') DEFAULT 'flexible',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id)
      )
    `);
    console.log('✅ Staff profiles table created');

    // Create patients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other') NOT NULL,
        blood_group VARCHAR(5),
        contact_number VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        emergency_contact_name VARCHAR(255),
        emergency_contact_number VARCHAR(20),
        medical_history TEXT,
        allergies TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_contact (contact_number)
      )
    `);
    console.log('✅ Patients table created');

    // Create appointments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id VARCHAR(50) UNIQUE NOT NULL,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        appointment_type VARCHAR(50) NOT NULL,
        status ENUM('scheduled', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
        reason_for_visit TEXT,
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_appointment_date (appointment_date),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Appointments table created');

    // Create admissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admission_id VARCHAR(50) UNIQUE NOT NULL,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        room_id INT,
        admission_date DATETIME NOT NULL,
        discharge_date DATETIME,
        admission_type ENUM('emergency', 'planned', 'transfer') NOT NULL,
        status ENUM('active', 'discharged', 'transferred') DEFAULT 'active',
        diagnosis TEXT,
        chief_complaint TEXT,
        notes TEXT,
        admitted_by INT,
        discharged_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_admission_date (admission_date),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Admissions table created');

    // Create rooms table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(20) UNIQUE NOT NULL,
        floor_number INT NOT NULL,
        room_type ENUM('general', 'semi-private', 'private', 'icu', 'emergency') NOT NULL,
        capacity INT NOT NULL DEFAULT 1,
        current_occupancy INT NOT NULL DEFAULT 0,
        status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
        daily_rate DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_type (room_type)
      )
    `);
    console.log('✅ Rooms table created');

    // Insert sample doctor if none exists
    const [doctors] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "doctor"'
    );

    if (doctors[0].count === 0) {
      console.log('Creating sample doctor...');
      
      // Create doctor user
      const [userResult] = await connection.execute(`
        INSERT INTO users (name, email, password_hash, role, is_active) 
        VALUES (?, ?, ?, ?, ?)
      `, ['Dr. John Smith', 'dr.smith@hospital.com', '$2a$10$xxxxxxxxxxx', 'doctor', 1]);
      
      // Create doctor profile
      await connection.execute(`
        INSERT INTO staff_profiles (
          user_id, department, specialization, qualifications,
          experience_years, license_number, contact_number, address, hire_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userResult.insertId,
        'General Medicine',
        'Internal Medicine',
        'MBBS, MD Internal Medicine',
        10,
        'MED123456',
        '+1234567890',
        '123 Hospital St',
        new Date()
      ]);
      
      console.log('✅ Sample doctor created');
    }

    console.log('\n✅ Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupCompleteDatabase().catch(console.error);