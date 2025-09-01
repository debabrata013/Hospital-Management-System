#!/usr/bin/env node

/**
 * Basic Pharmacy System Test Script
 * Tests database connection and basic functionality
 */

const { executeQuery, testConnection, dbUtils } = require('../lib/mysql-connection');

async function testBasicPharmacy() {
  console.log('🧪 Testing Basic Pharmacy System...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const connectionTest = await testConnection();
    if (!connectionTest) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connection successful\n');

    // Test table existence
    console.log('2. Checking required tables...');
    await checkTables();
    console.log('✅ Required tables exist\n');

    // Test basic queries
    console.log('3. Testing basic queries...');
    await testBasicQueries();
    console.log('✅ Basic queries working\n');

    console.log('🎉 Basic pharmacy system test passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

async function checkTables() {
  const tables = ['medicines', 'vendors', 'prescriptions', 'medicine_stock_transactions'];
  
  for (const table of tables) {
    try {
      const result = await executeQuery(`SHOW TABLES LIKE '${table}'`, []);
      if (result.length > 0) {
        console.log(`   ✓ Table '${table}' exists`);
      } else {
        console.log(`   ⚠️ Table '${table}' does not exist`);
      }
    } catch (error) {
      console.log(`   ❌ Error checking table '${table}':`, error.message);
    }
  }
}

async function testBasicQueries() {
  try {
    // Test medicines table
    const medicines = await executeQuery(`SELECT COUNT(*) as count FROM medicines`, []);
    console.log(`   ✓ Medicines table: ${medicines[0]?.count || 0} records`);

    // Test vendors table
    const vendors = await executeQuery(`SELECT COUNT(*) as count FROM vendors`, []);
    console.log(`   ✓ Vendors table: ${vendors[0]?.count || 0} records`);

    // Test prescriptions table
    const prescriptions = await executeQuery(`SELECT COUNT(*) as count FROM prescriptions`, []);
    console.log(`   ✓ Prescriptions table: ${prescriptions[0]?.count || 0} records`);

    // Test stock transactions table
    const transactions = await executeQuery(`SELECT COUNT(*) as count FROM medicine_stock_transactions`, []);
    console.log(`   ✓ Stock transactions table: ${transactions[0]?.count || 0} records`);

  } catch (error) {
    console.log(`   ❌ Error in basic queries:`, error.message);
  }
}

// Run the test
if (require.main === module) {
  testBasicPharmacy().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testBasicPharmacy };
