#!/usr/bin/env node

// Database Connection Test Script
// Hospital Management System - MySQL Migration

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '148.222.53.8',
  user: process.env.DB_USER || 'hospital',
  password: process.env.DB_PASSWORD || 'Hospital2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+05:30'
};

async function testConnection() {
  console.log('🔍 Testing MySQL Database Connection...\n');
  console.log('Configuration:');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: ${dbConfig.database}`);
  console.log(`Port: ${dbConfig.port}\n`);

  let connection;

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Basic connection successful\n');

    // Test database selection
    console.log('2. Testing database selection...');
    await connection.execute(`USE ${dbConfig.database}`);
    console.log('✅ Database selection successful\n');

    // Test simple query
    console.log('3. Testing simple query...');
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Simple query successful');
    console.log(`   Result: ${JSON.stringify(rows[0])}\n`);

    // Check if tables exist
    console.log('4. Checking existing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found - Database schema needs to be created');
      console.log('   Run: mysql -h host -u user -p database < database/mysql-schema.sql\n');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
      console.log('');
    }

    // Test table structure (if users table exists)
    const userTableExists = tables.some(table => 
      Object.values(table)[0] === 'users'
    );

    if (userTableExists) {
      console.log('5. Testing users table structure...');
      const [columns] = await connection.execute('DESCRIBE users');
      console.log('✅ Users table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      console.log('');

      // Test sample data
      console.log('6. Checking sample data...');
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Users table has ${users[0].count} records\n`);
    }

    // Test connection pool
    console.log('7. Testing connection pool...');
    const pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 5,
      queueLimit: 0
    });

    const poolConnection = await pool.getConnection();
    const [poolTest] = await poolConnection.execute('SELECT CONNECTION_ID() as id');
    poolConnection.release();
    await pool.end();
    
    console.log('✅ Connection pool test successful');
    console.log(`   Connection ID: ${poolTest[0].id}\n`);

    console.log('🎉 All database tests passed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. If no tables exist, run the schema creation scripts');
    console.log('2. Update your API routes to use MySQL instead of MongoDB');
    console.log('3. Test your application endpoints');
    console.log('4. Run data migration if needed\n');

  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - Check if MySQL server is running');
      console.error('   - Verify host and port are correct');
      console.error('   - Check firewall settings');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - Verify username and password');
      console.error('   - Check user permissions');
      console.error('   - Ensure user can connect from your IP');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n🔧 Troubleshooting:');
      console.error('   - Check if database name is correct');
      console.error('   - Ensure database exists');
      console.error('   - Verify user has access to the database');
    }
    
    console.error('\n📞 Contact Hostinger support if issues persist');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Performance test
async function performanceTest() {
  console.log('\n⚡ Running Performance Test...');
  
  const pool = mysql.createPool({
    ...dbConfig,
    connectionLimit: 10,
    queueLimit: 0
  });

  const startTime = Date.now();
  const promises = [];

  // Run 50 concurrent queries
  for (let i = 0; i < 50; i++) {
    promises.push(
      pool.execute('SELECT ? as query_number, NOW() as timestamp', [i])
    );
  }

  try {
    await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Performance test completed`);
    console.log(`   50 concurrent queries executed in ${duration}ms`);
    console.log(`   Average: ${(duration / 50).toFixed(2)}ms per query`);
    
    if (duration < 1000) {
      console.log('   🚀 Excellent performance!');
    } else if (duration < 3000) {
      console.log('   ✅ Good performance');
    } else {
      console.log('   ⚠️  Consider optimizing connection pool settings');
    }
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Main execution
async function main() {
  await testConnection();
  
  // Ask if user wants to run performance test
  const args = process.argv.slice(2);
  if (args.includes('--performance') || args.includes('-p')) {
    await performanceTest();
  } else {
    console.log('💡 Run with --performance flag to test database performance');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the test
main().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
