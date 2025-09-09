#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function checkStaffSchema() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database\n');

    // Check users table for staff roles
    console.log('🔍 Users table - staff related roles:');
    const [staffUsers] = await connection.execute(`
      SELECT role, COUNT(*) as count FROM users 
      WHERE role IN ('pharmacy', 'receptionist', 'staff') 
      GROUP BY role
    `);
    console.log('Current staff in users table:');
    staffUsers.forEach(staff => {
      console.log(`   ${staff.role}: ${staff.count} users`);
    });

    // Check if staff table exists
    console.log('\n📋 Checking staff-related tables:');
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE '%staff%'
    `);
    console.log('Staff-related tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Check staff table structure if exists
    if (tables.some(t => Object.values(t)[0] === 'staff')) {
      console.log('\n🔍 Staff table structure:');
      const [staffColumns] = await connection.execute('DESCRIBE staff');
      staffColumns.forEach(col => {
        console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
      });
    }

    // Check cleaning_staff table structure if exists
    if (tables.some(t => Object.values(t)[0] === 'cleaning_staff')) {
      console.log('\n🔍 Cleaning_staff table structure:');
      const [cleaningColumns] = await connection.execute('DESCRIBE cleaning_staff');
      cleaningColumns.forEach(col => {
        console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
      });
    }

    // Check users table enum values for role
    console.log('\n🔍 Users table role enum values:');
    const [roleEnum] = await connection.execute(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `);
    console.log('Role enum values:', roleEnum[0].COLUMN_TYPE);

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkStaffSchema();
