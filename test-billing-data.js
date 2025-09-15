const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function testBillingData() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const today = new Date().toISOString().split('T')[0];
    
    console.log('🔍 Testing Billing Data Integration...');
    console.log('Today:', today);
    
    // Check payment methods used
    console.log('\n💳 Payment Methods in Database:');
    const [paymentMethods] = await connection.execute(
      'SELECT DISTINCT payment_method, COUNT(*) as count FROM bills GROUP BY payment_method'
    );
    paymentMethods.forEach(method => {
      console.log(`  - ${method.payment_method || 'NULL'}: ${method.count} bills`);
    });
    
    // Check today's data
    console.log('\n📅 Today\'s Billing Data:');
    const [todayData] = await connection.execute(`
      SELECT 
        SUM(CASE WHEN payment_method = 'cash' THEN final_amount ELSE 0 END) as cash,
        SUM(CASE WHEN payment_method = 'razorpay' THEN final_amount ELSE 0 END) as online,
        SUM(final_amount) as total,
        COUNT(*) as transactions
      FROM bills 
      WHERE DATE(created_at) = ? 
        AND payment_status = 'paid'
    `, [today]);
    
    const data = todayData[0];
    console.log(`  Cash: ₹${data.cash || 0}`);
    console.log(`  Online: ₹${data.online || 0}`);
    console.log(`  Total: ₹${data.total || 0}`);
    console.log(`  Transactions: ${data.transactions}`);
    
    // Check recent bills
    console.log('\n📋 Recent Bills:');
    const [recentBills] = await connection.execute(
      'SELECT bill_id, final_amount, payment_method, payment_status, created_at FROM bills ORDER BY created_at DESC LIMIT 5'
    );
    
    if (recentBills.length === 0) {
      console.log('  ❌ No bills found - Create some bills in receptionist dashboard');
    } else {
      recentBills.forEach(bill => {
        console.log(`  ${bill.bill_id}: ₹${bill.final_amount} (${bill.payment_method || 'pending'}) - ${bill.payment_status}`);
      });
    }
    
    // Test analytics query
    console.log('\n📊 Analytics Query Test:');
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [analyticsData] = await connection.execute(`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN payment_method = 'cash' THEN final_amount ELSE 0 END) as cash,
        SUM(CASE WHEN payment_method = 'razorpay' THEN final_amount ELSE 0 END) as online,
        SUM(final_amount) as total
      FROM bills 
      WHERE DATE(created_at) BETWEEN ? AND ? 
        AND payment_status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
    `, [startDate, today]);
    
    if (analyticsData.length === 0) {
      console.log('  ❌ No paid bills in last 7 days');
    } else {
      console.log('  ✅ Last 7 days data:');
      analyticsData.forEach(day => {
        console.log(`    ${day.date}: Cash ₹${day.cash}, Online ₹${day.online}, Total ₹${day.total}`);
      });
    }
    
    await connection.end();
    console.log('\n✅ Billing data test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBillingData();
