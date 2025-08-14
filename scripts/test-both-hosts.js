#!/usr/bin/env node

// Test Both Hostname and IP Address
// Hospital Management System - MySQL Migration

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing Both Hostname and IP Address...\n');

const testConfigs = [
  {
    name: 'Hostname: srv2047.hstgr.io',
    config: {
      host: 'srv2047.hstgr.io',
      user: 'admin',
      password: 'Admin!2025',
      database: 'u153229971_Hospital',
      port: 3306,
      connectTimeout: 60000
    }
  },
  {
    name: 'IP Address: 148.222.53.8',
    config: {
      host: '148.222.53.8',
      user: 'admin',
      password: 'Admin!2025',
      database: 'u153229971_Hospital',
      port: 3306,
      connectTimeout: 60000
    }
  },
  {
    name: 'Hostname with SSL disabled',
    config: {
      host: 'srv2047.hstgr.io',
      user: 'admin',
      password: 'Admin!2025',
      database: 'u153229971_Hospital',
      port: 3306,
      ssl: false,
      connectTimeout: 60000
    }
  },
  {
    name: 'IP with SSL disabled',
    config: {
      host: '148.222.53.8',
      user: 'admin',
      password: 'Admin!2025',
      database: 'u153229971_Hospital',
      port: 3306,
      ssl: false,
      connectTimeout: 60000
    }
  }
];

async function testConnection(configData) {
  console.log(`\n🧪 Testing: ${configData.name}`);
  console.log(`   Host: ${configData.config.host}`);
  console.log(`   User: ${configData.config.user}`);
  console.log(`   Database: ${configData.config.database}`);
  console.log(`   Port: ${configData.config.port}`);
  
  let connection;
  
  try {
    console.log('   Attempting connection...');
    connection = await mysql.createConnection(configData.config);
    console.log('   ✅ Connection successful!');
    
    console.log('   Testing query...');
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time, DATABASE() as current_db');
    console.log('   ✅ Query successful!');
    console.log(`   Result: ${JSON.stringify(rows[0])}`);
    
    console.log('   Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`   Found ${tables.length} tables`);
    
    if (tables.length > 0) {
      console.log('   Tables:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`     - ${tableName}`);
      });
    }
    
    console.log('   🎉 This configuration works perfectly!');
    return true;
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    console.log(`   Error Code: ${error.code}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   💡 This is an access denied error - check user credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Connection refused - check host and port');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   💡 Host not found - check hostname');
    }
    
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive connection tests...\n');
  console.log('Current credentials:');
  console.log('   Username: admin');
  console.log('   Password: Admin!2025');
  console.log('   Database: u153229971_Hospital');
  
  let successCount = 0;
  let workingConfig = null;
  
  for (const config of testConfigs) {
    const success = await testConnection(config);
    if (success) {
      successCount++;
      workingConfig = config;
      break; // Stop at first successful connection
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (successCount > 0) {
    console.log('🎉 SUCCESS! Database connection is working!');
    console.log(`✅ Working configuration: ${workingConfig.name}`);
    console.log('\n📋 Next steps:');
    console.log('1. Update .env.local with working configuration');
    console.log('2. Create database schema');
    console.log('3. Create admin user and sample data');
    console.log('4. Start the application');
    console.log('\nRun: npm run setup:complete');
  } else {
    console.log('❌ All connection attempts failed.');
    console.log('\n🔧 Troubleshooting checklist:');
    console.log('1. ✓ Remote access enabled with "%" in Hostinger');
    console.log('2. ? User "admin" exists in Hostinger MySQL Users');
    console.log('3. ? Password is exactly "Admin!2025"');
    console.log('4. ? User has ALL PRIVILEGES on u153229971_Hospital');
    console.log('\n💡 Try these solutions:');
    console.log('• Login to Hostinger → Database → MySQL Databases');
    console.log('• Verify user "admin" exists and has correct password');
    console.log('• Try creating a new user with simpler password (no special chars)');
    console.log('• Test connection via phpMyAdmin first');
  }
  
  console.log('\n' + '='.repeat(60));
}

runAllTests();
