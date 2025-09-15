const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function checkBillsStructure() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking bills table structure...');
    
    // Check bills table structure
    const [billsColumns] = await connection.execute('DESCRIBE bills');
    console.log('\n📋 Bills table columns:');
    billsColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check sample data
    console.log('\n💰 Sample bills data:');
    const [sampleBills] = await connection.execute('SELECT * FROM bills LIMIT 3');
    if (sampleBills.length === 0) {
      console.log('  ❌ No bills found');
    } else {
      sampleBills.forEach((bill, index) => {
        console.log(`  ${index + 1}. ID: ${bill.id}, Amount: ${bill.final_amount || bill.total_amount}, Payment: ${bill.payment_method}, Status: ${bill.payment_status}`);
      });
    }
    
    // Check today's data
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n📅 Today's bills (${today}):`);
    const [todayBills] = await connection.execute(
      'SELECT COUNT(*) as count, SUM(final_amount) as total FROM bills WHERE DATE(created_at) = ?',
      [today]
    );
    console.log(`  Total bills today: ${todayBills[0].count}`);
    console.log(`  Total amount today: ₹${todayBills[0].total || 0}`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBillsStructure();
