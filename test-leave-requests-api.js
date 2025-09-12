#!/usr/bin/env node

// Test script to verify leave requests API functionality

const testAPI = async () => {
  console.log('🧪 Testing Leave Requests API\n');

  try {
    // Test 1: Check if we can reach the API endpoint
    console.log('1. Testing API endpoint availability...');
    const response = await fetch('http://localhost:3000/api/doctor/leave-requests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ API endpoint exists but requires authentication (expected)');
    } else {
      const data = await response.json();
      console.log('Response:', data);
    }

    // Test 2: Check database connection and table structure
    console.log('\n2. Testing database connection...');
    const mysql = require('mysql2/promise');
    
    const dbConfig = {
      host: process.env.DB_HOST || 'srv2047.hstgr.io',
      user: process.env.DB_USER || 'u153229971_admin',
      password: process.env.DB_PASSWORD || 'Admin!2025',
      database: process.env.DB_NAME || 'u153229971_Hospital',
      port: 3306
    };

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');

    // Check if leave_requests table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'leave_requests'");
    if (tables.length > 0) {
      console.log('✅ leave_requests table exists');
      
      // Check table structure
      const [columns] = await connection.execute('DESCRIBE leave_requests');
      console.log('Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
      
      // Check existing data
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM leave_requests');
      console.log(`\n📊 Total leave requests in database: ${rows[0].count}`);
      
      // Show sample data if any
      if (rows[0].count > 0) {
        const [sampleData] = await connection.execute('SELECT * FROM leave_requests LIMIT 3');
        console.log('\nSample data:');
        console.table(sampleData);
      }
    } else {
      console.log('❌ leave_requests table does not exist');
    }

    // Check if users table has doctors
    const [doctors] = await connection.execute('SELECT user_id, name FROM users WHERE role = "doctor" LIMIT 5');
    console.log(`\n👨‍⚕️ Doctors in database: ${doctors.length}`);
    doctors.forEach(doc => {
      console.log(`  - ${doc.user_id}: ${doc.name}`);
    });

    await connection.end();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testAPI();
