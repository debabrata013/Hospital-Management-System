#!/usr/bin/env node

// Create Initial Admin User Script
// Hospital Management System - MySQL Migration

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '148.222.53.8',
  user: process.env.DB_USER || 'hospital',
  password: process.env.DB_PASSWORD || 'Hospital2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+05:30'
};

async function createAdminUser() {
  console.log('🔧 Creating Initial Admin User...\n');

  let connection;

  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ? OR role = "super-admin"',
      ['admin@arogyahospital.com']
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Admin user already exists. Skipping creation.\n');
      return;
    }

    // Generate password hash
    const password = 'Admin@123';
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate unique IDs
    const userId = `USR${Date.now().toString(36).toUpperCase()}`;
    const employeeId = `EMP${Date.now().toString(36).toUpperCase()}`;

    // Create admin user
    const adminData = {
      user_id: userId,
      name: 'Super Administrator',
      email: 'admin@arogyahospital.com',
      password_hash: passwordHash,
      role: 'super-admin',
      contact_number: '+91-9999999999',
      employee_id: employeeId,
      department: 'Administration',
      is_active: true,
      is_verified: true,
      joining_date: new Date().toISOString().split('T')[0],
      created_at: new Date()
    };

    // Insert admin user
    const [result] = await connection.execute(`
      INSERT INTO users (
        user_id, name, email, password_hash, role, contact_number, 
        employee_id, department, is_active, is_verified, joining_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      adminData.user_id,
      adminData.name,
      adminData.email,
      adminData.password_hash,
      adminData.role,
      adminData.contact_number,
      adminData.employee_id,
      adminData.department,
      adminData.is_active,
      adminData.is_verified,
      adminData.joining_date,
      adminData.created_at
    ]);

    const adminUserId = result.insertId;

    // Create staff profile
    await connection.execute(`
      INSERT INTO staff_profiles (
        user_id, employee_type, created_at
      ) VALUES (?, 'full-time', ?)
    `, [adminUserId, new Date()]);

    // Set default permissions for super-admin
    const modules = ['patients', 'appointments', 'billing', 'inventory', 'reports', 'users', 'messages', 'shifts'];
    for (const module of modules) {
      await connection.execute(`
        INSERT INTO user_permissions (user_id, module, permissions, created_at)
        VALUES (?, ?, ?, ?)
      `, [
        adminUserId,
        module,
        JSON.stringify(['create', 'read', 'update', 'delete', 'approve']),
        new Date()
      ]);
    }

    // Create audit log
    await connection.execute(`
      INSERT INTO audit_logs (
        log_id, user_id, action, resource_type, resource_id, new_values, created_at
      ) VALUES (?, ?, 'CREATE', 'users', ?, ?, ?)
    `, [
      `LOG${Date.now()}`,
      adminUserId,
      adminUserId.toString(),
      JSON.stringify({ action: 'initial_admin_creation' }),
      new Date()
    ]);

    console.log('🎉 Admin user created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${adminData.role}`);
    console.log(`   User ID: ${adminData.user_id}`);
    console.log(`   Employee ID: ${adminData.employee_id}\n`);
    
    console.log('⚠️  IMPORTANT: Change the default password after first login!\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Create sample data
async function createSampleData() {
  console.log('📊 Creating Sample Data...\n');

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Create sample departments
    const departments = [
      { id: 'DEPT001', name: 'General Medicine', description: 'General medical consultations' },
      { id: 'DEPT002', name: 'Cardiology', description: 'Heart and cardiovascular treatments' },
      { id: 'DEPT003', name: 'Orthopedics', description: 'Bone and joint treatments' },
      { id: 'DEPT004', name: 'Pediatrics', description: 'Child healthcare' },
      { id: 'DEPT005', name: 'Emergency', description: 'Emergency medical services' }
    ];

    for (const dept of departments) {
      await connection.execute(`
        INSERT IGNORE INTO departments (department_id, department_name, description, is_active, created_at)
        VALUES (?, ?, ?, TRUE, ?)
      `, [dept.id, dept.name, dept.description, new Date()]);
    }

    // Create sample rooms
    const rooms = [
      { number: 'C001', type: 'consultation', department_id: 1, floor: 1 },
      { number: 'C002', type: 'consultation', department_id: 2, floor: 1 },
      { number: 'E001', type: 'emergency', department_id: 5, floor: 0 },
      { number: 'W001', type: 'ward', department_id: 1, floor: 2 }
    ];

    for (const room of rooms) {
      await connection.execute(`
        INSERT IGNORE INTO rooms (room_number, room_type, department_id, floor_number, capacity, is_available, created_at)
        VALUES (?, ?, ?, ?, 1, TRUE, ?)
      `, [room.number, room.type, room.department_id, room.floor, new Date()]);
    }

    // Create sample medicines
    const medicines = [
      {
        id: 'MED001',
        name: 'Paracetamol',
        generic_name: 'Acetaminophen',
        category: 'Analgesic',
        dosage_form: 'tablet',
        strength: '500mg',
        unit_price: 2.50,
        mrp: 3.00,
        stock: 1000
      },
      {
        id: 'MED002',
        name: 'Amoxicillin',
        generic_name: 'Amoxicillin',
        category: 'Antibiotic',
        dosage_form: 'capsule',
        strength: '250mg',
        unit_price: 5.00,
        mrp: 6.00,
        stock: 500
      }
    ];

    for (const med of medicines) {
      await connection.execute(`
        INSERT IGNORE INTO medicines (
          medicine_id, name, generic_name, category, dosage_form, strength,
          unit_price, mrp, current_stock, minimum_stock, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 10, TRUE, ?)
      `, [
        med.id, med.name, med.generic_name, med.category, med.dosage_form,
        med.strength, med.unit_price, med.mrp, med.stock, new Date()
      ]);
    }

    console.log('✅ Sample data created successfully!\n');

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  await createAdminUser();
  
  if (args.includes('--sample-data') || args.includes('-s')) {
    await createSampleData();
  } else {
    console.log('💡 Run with --sample-data flag to create sample departments, rooms, and medicines');
  }
  
  console.log('🎉 Setup complete! You can now start your application and login with the admin credentials.\n');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Setup interrupted by user');
  process.exit(0);
});

// Run the script
main().catch(error => {
  console.error('❌ Setup script failed:', error);
  process.exit(1);
});
