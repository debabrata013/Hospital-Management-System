#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database\n');

    // Show all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Existing tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Show users table structure
    console.log('\n🔍 Users table structure:');
    const [columns] = await connection.execute('DESCRIBE users');
    columns.forEach(col => {
      console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    // Show sample data
    console.log('\n📊 Sample users data:');
    const [users] = await connection.execute('SELECT * FROM users LIMIT 3');
    console.log('Found', users.length, 'users');
    users.forEach(user => {
      console.log(`   ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkDatabase();
