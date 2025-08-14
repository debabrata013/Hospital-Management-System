#!/usr/bin/env node

// Test Different Database Configurations
// Hospital Management System - MySQL Migration

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing Different MySQL Configurations...\n');

const configs = [
  {
    name: 'Config 1: IP with standard port',
    config: {
      host: '148.222.53.8',
      user: process.env.DB_USER || 'hospital',
      password: process.env.DB_PASSWORD || 'Hospital2025',
      database: process.env.DB_NAME || 'u153229971_Hospital',
      port: 3306
    }
  },
  {
    name: 'Config 2: Hostname with standard port',
    config: {
      host: 'srv2047.hstgr.io',
      user: process.env.DB_USER || 'hospital',
      password: process.env.DB_PASSWORD || 'Hospital2025',
      database: process.env.DB_NAME || 'u153229971_Hospital',
      port: 3306
    }
  },
  {
    name: 'Config 3: With SSL disabled explicitly',
    config: {
      host: '148.222.53.8',
      user: process.env.DB_USER || 'hospital',
      password: process.env.DB_PASSWORD || 'Hospital2025',
      database: process.env.DB_NAME || 'u153229971_Hospital',
      port: 3306,
      ssl: false
    }
  },
  {
    name: 'Config 4: With connection timeout',
    config: {
      host: '148.222.53.8',
      user: process.env.DB_USER || 'hospital',
      password: process.env.DB_PASSWORD || 'Hospital2025',
      database: process.env.DB_NAME || 'u153229971_Hospital',
      port: 3306,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
    }
  }
];

async function testConfig(configData) {
  console.log(`\n🧪 Testing: ${configData.name}`);
  console.log(`   Host: ${configData.config.host}`);
  console.log(`   User: ${configData.config.user}`);
  console.log(`   Database: ${configData.config.database}`);
  console.log(`   Port: ${configData.config.port}`);
  
  let connection;
  
  try {
    connection = await mysql.createConnection(configData.config);
    console.log('   ✅ Connection successful!');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('   ✅ Query successful!');
    
    return true;
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    console.log(`   Code: ${error.code}`);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function testAllConfigs() {
  console.log('Current IP detected from previous error: 182.72.101.29\n');
  
  let successCount = 0;
  
  for (const config of configs) {
    const success = await testConfig(config);
    if (success) {
      successCount++;
      console.log('   🎉 This configuration works!');
      break; // Stop at first successful connection
    }
  }
  
  if (successCount === 0) {
    console.log('\n❌ None of the configurations worked.');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. In Hostinger Control Panel → Database:');
    console.log('   - Check if user "hospital" exists and has ALL PRIVILEGES');
    console.log('   - Verify the password is exactly "Hospital2025"');
    console.log('   - Make sure Remote MySQL shows "%" for u153229971_Hospital');
    console.log('');
    console.log('2. Try creating a new database user:');
    console.log('   - Username: admin');
    console.log('   - Password: Admin@123');
    console.log('   - Privileges: ALL on u153229971_Hospital');
    console.log('');
    console.log('3. Alternative: Use phpMyAdmin to check connection');
    console.log('   - Login to Hostinger phpMyAdmin');
    console.log('   - Try to access u153229971_Hospital database');
    console.log('');
  } else {
    console.log('\n🎉 Database connection successful!');
    console.log('You can now proceed with creating the database schema.');
  }
}

testAllConfigs();
