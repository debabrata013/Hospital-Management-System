#!/usr/bin/env node

// Automated Database Schema Creation
// Hospital Management System - MySQL Migration

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🏗️  Creating Database Schema...\n');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  multipleStatements: true // Allow multiple SQL statements
};

async function createSchema() {
  let connection;
  
  try {
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!\n');
    
    // Read the complete schema file
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(process.cwd(), 'database', 'complete-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found. Please ensure database/complete-schema.sql exists.');
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded successfully!\n');
    
    // Remove the DROP DATABASE and CREATE DATABASE statements since we're already connected
    const cleanedSQL = schemaSQL
      .replace(/DROP DATABASE IF EXISTS u153229971_Hospital;/g, '')
      .replace(/CREATE DATABASE u153229971_Hospital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;/g, '')
      .replace(/USE u153229971_Hospital;/g, '');
    
    console.log('🏗️  Creating database schema...');
    console.log('This may take a few moments...\n');
    
    // Split SQL into individual statements and execute them
    const statements = cleanedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let createdTables = 0;
    let insertedData = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) continue;
      
      try {
        await connection.execute(statement);
        
        if (statement.toUpperCase().startsWith('CREATE TABLE')) {
          createdTables++;
          const tableName = statement.match(/CREATE TABLE\s+(\w+)/i)?.[1];
          console.log(`✅ Created table: ${tableName}`);
        } else if (statement.toUpperCase().startsWith('INSERT INTO')) {
          insertedData++;
          if (insertedData <= 10) { // Show first 10 inserts
            const tableName = statement.match(/INSERT INTO\s+(\w+)/i)?.[1];
            console.log(`📝 Inserted data into: ${tableName}`);
          }
        } else if (statement.toUpperCase().startsWith('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX\s+(\w+)/i)?.[1];
          console.log(`🔍 Created index: ${indexName}`);
        }
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⚠️  Table already exists (skipping)`);
        } else if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Duplicate entry (skipping)`);
        } else {
          console.error(`❌ Error executing statement: ${error.message}`);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }
    
    console.log('\n🎉 Schema creation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Tables created: ${createdTables}`);
    console.log(`   - Data inserts: ${insertedData}`);
    
    // Verify tables were created
    console.log('\n🔍 Verifying created tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Total tables in database: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('\n📋 Tables created:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    }
    
    console.log('\n🎉 Database schema is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run db:create-admin:sample');
    console.log('2. Start: npm run dev');
    console.log('3. Test: npm run test:apis');
    
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createSchema();
