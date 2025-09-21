#!/usr/bin/env node

// Simple database connection test
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.DB_HOST);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  console.log('Port:', process.env.DB_PORT);

  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    connectTimeout: 30000,
    acquireTimeout: 30000,
    timeout: 30000,
  };

  let connection;
  try {
    console.log('\n1. Creating connection...');
    connection = await mysql.createConnection(config);
    console.log('✓ Connection created successfully');

    console.log('\n2. Testing basic query...');
    const [results] = await connection.execute('SELECT 1 as test', []);
    console.log('✓ Basic query successful:', results);

    console.log('\n3. Testing patients table...');
    const [patients] = await connection.execute('SELECT COUNT(*) as count FROM patients', []);
    console.log('✓ Patients table accessible, count:', patients);

    console.log('\n4. Testing column information...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'patients'
      LIMIT 5
    `, [process.env.DB_NAME]);
    console.log('✓ Column information retrieved:', columns);

    console.log('\n✅ All database tests passed!');
  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Connection closed');
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}

testConnection();