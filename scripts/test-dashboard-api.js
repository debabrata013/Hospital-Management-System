const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hospital_management',
  port: 3306
};

async function testDashboardAPI() {
  try {
    console.log('🔍 Testing dashboard API...');
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');
    
    // Test basic queries that the dashboard API uses
    console.log('\n📊 Testing dashboard queries...');
    
    // Test patients count
    try {
      const [patientsResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM patients WHERE is_active = 1'
      );
      console.log('✅ Patients count:', patientsResult[0].total);
    } catch (error) {
      console.log('❌ Patients query failed:', error.message);
    }
    
    // Test appointments count
    try {
      const [appointmentsResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM appointments'
      );
      console.log('✅ Appointments count:', appointmentsResult[0].total);
    } catch (error) {
      console.log('❌ Appointments query failed:', error.message);
    }
    
    // Test users count
    try {
      const [usersResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM users WHERE role = "doctor" AND is_active = 1'
      );
      console.log('✅ Doctors count:', usersResult[0].total);
    } catch (error) {
      console.log('❌ Users query failed:', error.message);
    }
    
    // Test billing table if it exists
    try {
      const [billingResult] = await connection.execute(
        'SELECT COALESCE(SUM(total_amount), 0) as total FROM billing WHERE status = "Paid"'
      );
      console.log('✅ Revenue query:', billingResult[0].total);
    } catch (error) {
      console.log('⚠️  Billing query failed (table might not exist):', error.message);
    }
    
    await connection.end();
    console.log('\n✅ Dashboard API test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDashboardAPI();
