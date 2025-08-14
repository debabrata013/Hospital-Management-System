#!/usr/bin/env node

// Quick Database Connection Test
// Hospital Management System - MySQL Migration

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function quickTest() {
  console.log('🚀 Quick Database Test...\n');
  
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  };
  
  console.log(`Connecting to: ${dbConfig.host}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: ${dbConfig.database}\n`);
  
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection successful!');
    
    // Simple test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful!');
    
    // Check database
    const [dbRows] = await connection.execute('SELECT DATABASE() as db_name');
    console.log(`✅ Connected to database: ${dbRows[0].db_name}`);
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables`);
    
    if (tables.length === 0) {
      console.log('\n🎯 NEXT STEP: Create database schema');
      console.log('Upload these files to Hostinger phpMyAdmin:');
      console.log('• database/mysql-schema.sql');
      console.log('• database/mysql-schema-part2.sql');
      console.log('• database/mysql-schema-part3.sql');
    } else {
      console.log('\n🎉 Database schema exists! Ready to proceed.');
    }
    
    console.log('\n🎉 DATABASE CONNECTION IS WORKING PERFECTLY!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

quickTest();
