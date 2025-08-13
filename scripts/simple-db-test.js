#!/usr/bin/env node

// Simple Database Connection Test
// Hospital Management System - MySQL Migration

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing MySQL Database Connection...\n');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+05:30'
};

console.log('Configuration:');
console.log(`Host: ${dbConfig.host}`);
console.log(`User: ${dbConfig.user}`);
console.log(`Database: ${dbConfig.database}`);
console.log(`Port: ${dbConfig.port}\n`);

async function testConnection() {
  let connection;
  
  try {
    console.log('Attempting to connect...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection successful!\n');
    
    console.log('Testing simple query...');
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Query successful!');
    console.log(`Result: ${JSON.stringify(rows[0])}\n`);
    
    console.log('Checking database info...');
    const [dbInfo] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as version');
    console.log('✅ Database info retrieved!');
    console.log(`Current Database: ${dbInfo[0].current_db}`);
    console.log(`Server Version: ${dbInfo[0].version}\n`);
    
    console.log('Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`Found ${tables.length} tables\n`);
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. You need to create the database schema.');
      console.log('\n📋 Next steps:');
      console.log('1. Create the database schema using the SQL files');
      console.log('2. Run: npm run db:create-admin:sample');
      console.log('3. Start the application: npm run dev');
      console.log('4. Test APIs: npm run test:apis\n');
      
      console.log('🚀 To create schema, you can:');
      console.log('• Upload the SQL files via Hostinger phpMyAdmin');
      console.log('• Or run via command line (if mysql client is available)');
      console.log('• Files to upload: database/mysql-schema.sql, mysql-schema-part2.sql, mysql-schema-part3.sql\n');
    } else {
      console.log('✅ Database schema exists!');
      console.log('Tables found:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
      console.log('\n🎉 Database is ready! You can now:');
      console.log('1. Run: npm run db:create-admin:sample');
      console.log('2. Start: npm run dev');
      console.log('3. Test: npm run test:apis\n');
    }
    
    console.log('🎉 Database connection test completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}\n`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔧 This is an access denied error. Solutions:');
      console.log('1. Check if remote access is enabled for your IP in Hostinger');
      console.log('2. Verify the username and password are correct');
      console.log('3. Make sure the database user has proper permissions\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Connection refused. Solutions:');
      console.log('1. Check if the host and port are correct');
      console.log('2. Verify the MySQL server is running');
      console.log('3. Check firewall settings\n');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();
