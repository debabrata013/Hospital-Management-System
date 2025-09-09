#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function setupDatabase() {
  console.log('🗄️ Setting up MySQL Database for Hospital Management System\n');

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');

    // Check if users table exists
    console.log('\n📋 Checking existing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Existing tables:', tables.map(t => Object.values(t)[0]));

    // Create users table if it doesn't exist
    console.log('\n🔧 Creating/updating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        mobile VARCHAR(15),
        contact_number VARCHAR(15),
        password VARCHAR(255) NOT NULL,
        role ENUM('super-admin', 'admin', 'doctor', 'staff', 'receptionist', 'patient', 'pharmacy') NOT NULL,
        department VARCHAR(100),
        specialization VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT TRUE,
        permissions JSON,
        experience VARCHAR(100),
        patients_treated VARCHAR(100),
        description TEXT,
        available_schedule VARCHAR(255),
        languages VARCHAR(255),
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/updated');

    // Insert default super admin if not exists
    console.log('\n👑 Creating default super admin...');
    const [existingSuperAdmin] = await connection.execute(
      'SELECT id FROM users WHERE role = "super-admin" LIMIT 1'
    );

    if (existingSuperAdmin.length === 0) {
      await connection.execute(`
        INSERT INTO users (
          user_id, name, email, mobile, contact_number, password, role, 
          department, is_active, is_verified, permissions
        ) VALUES (
          'SA001', 'Super Administrator', 'superadmin@hospital.com', 
          '9876543210', '9876543210', '123456', 'super-admin', 
          'Administration', TRUE, TRUE, 
          '["all"]'
        )
      `);
      console.log('✅ Default super admin created');
      console.log('   Mobile: 9876543210');
      console.log('   Password: 123456');
    } else {
      console.log('✅ Super admin already exists');
    }

    // Insert default admin if not exists
    console.log('\n🏢 Creating default admin...');
    const [existingAdmin] = await connection.execute(
      'SELECT id FROM users WHERE user_id = "AD001" LIMIT 1'
    );

    if (existingAdmin.length === 0) {
      await connection.execute(`
        INSERT INTO users (
          user_id, name, email, mobile, contact_number, password, role, 
          department, is_active, is_verified, permissions
        ) VALUES (
          'AD001', 'Hospital Administrator', 'admin@hospital.com', 
          '9876543211', '9876543211', '654321', 'admin', 
          'Administration', TRUE, TRUE, 
          '["manage_users", "view_reports", "manage_appointments", "manage_rooms", "manage_billing"]'
        )
      `);
      console.log('✅ Default admin created');
      console.log('   Mobile: 9876543211');
      console.log('   Password: 654321');
    } else {
      console.log('✅ Default admin already exists');
    }

    // Insert default doctor if not exists
    console.log('\n👨‍⚕️ Creating default doctor...');
    const [existingDoctor] = await connection.execute(
      'SELECT id FROM users WHERE user_id = "DR001" LIMIT 1'
    );

    if (existingDoctor.length === 0) {
      await connection.execute(`
        INSERT INTO users (
          user_id, name, email, mobile, contact_number, password, role, 
          department, specialization, is_active, is_verified, permissions,
          experience, patients_treated, description, available_schedule, languages
        ) VALUES (
          'DR001', 'Dr. Rajesh Kumar', 'doctor@hospital.com', 
          '9876543212', '9876543212', '111111', 'doctor', 
          'Cardiology', 'Cardiology', TRUE, TRUE, 
          '["view_patients", "manage_prescriptions", "view_appointments", "update_medical_records"]',
          '5 years', '1000+', 'Experienced cardiologist specializing in heart diseases', 
          'Mon-Sat, 9am-1pm', 'Hindi, English'
        )
      `);
      console.log('✅ Default doctor created');
      console.log('   Mobile: 9876543212');
      console.log('   Password: 111111');
    } else {
      console.log('✅ Default doctor already exists');
    }

    // Show final user count
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Total users in database: ${userCount[0].count}`);

    await connection.end();
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('   Super Admin: 9876543210 / 123456 → /super-admin');
    console.log('   Admin: 9876543211 / 654321 → /admin');
    console.log('   Doctor: 9876543212 / 111111 → /doctor');

  } catch (error) {
    console.error('❌ Database setup error:', error);
  }
}

// Run setup
setupDatabase();
