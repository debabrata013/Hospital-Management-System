const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function checkBillingTables() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking billing-related tables...');
    
    // Check all tables
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('\n📋 All tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Check for billing-related tables
    const billingTables = tables.filter(table => {
      const tableName = Object.values(table)[0].toLowerCase();
      return tableName.includes('bill') || tableName.includes('payment') || tableName.includes('invoice');
    });
    
    console.log('\n💰 Billing-related tables:');
    if (billingTables.length === 0) {
      console.log('  ❌ No billing tables found');
    } else {
      billingTables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  ✅ ${tableName}`);
      });
    }
    
    // Check if we have any payment data in appointments
    console.log('\n💳 Checking appointments for payment data...');
    const [appointmentColumns] = await connection.execute('DESCRIBE appointments');
    const paymentColumns = appointmentColumns.filter(col => 
      col.Field.toLowerCase().includes('payment') || 
      col.Field.toLowerCase().includes('fee') || 
      col.Field.toLowerCase().includes('amount')
    );
    
    if (paymentColumns.length > 0) {
      console.log('  ✅ Payment-related columns in appointments:');
      paymentColumns.forEach(col => {
        console.log(`    - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('  ❌ No payment columns in appointments');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBillingTables();
