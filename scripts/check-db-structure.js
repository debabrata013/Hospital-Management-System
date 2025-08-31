const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function checkDatabaseStructure() {
  let connection;
  
  try {
    console.log('🔍 Checking existing database structure...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully');
    
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Existing tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    console.log('\n🔍 Checking key table structures...\n');
    
    // Check patients table
    try {
      const [patientColumns] = await connection.execute('DESCRIBE patients');
      console.log('📋 Patients table columns:');
      patientColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log('❌ Patients table not accessible');
    }
    
    // Check appointments table
    try {
      const [appointmentColumns] = await connection.execute('DESCRIBE appointments');
      console.log('\n📋 Appointments table columns:');
      appointmentColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log('❌ Appointments table not accessible');
    }
    
    // Check medicines table
    try {
      const [medicineColumns] = await connection.execute('DESCRIBE medicines');
      console.log('\n📋 Medicines table columns:');
      medicineColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log('❌ Medicines table not accessible');
    }
    
    // Check if doctors table exists
    try {
      const [doctorColumns] = await connection.execute('DESCRIBE doctors');
      console.log('\n📋 Doctors table columns:');
      doctorColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log('❌ Doctors table not accessible');
    }
    
    // Check if rooms table exists
    try {
      const [roomColumns] = await connection.execute('DESCRIBE rooms');
      console.log('\n📋 Rooms table columns:');
      roomColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log('❌ Rooms table not accessible');
    }
    
    // Check if admissions table exists
    try {
      const [admissionColumns] = await connection.execute('DESCRIBE admissions');
      console.log('\n📋 Admissions table columns:');
      admissionColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log('❌ Admissions table not accessible');
    }
    
    // Check if billing table exists
    try {
      const [billingColumns] = await connection.execute('DESCRIBE billing');
      console.log('\n📋 Billing table columns:');
      billingColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log('❌ Billing table not accessible');
    }
    
  } catch (error) {
    console.error('\n❌ Database check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkDatabaseStructure().catch(console.error);
