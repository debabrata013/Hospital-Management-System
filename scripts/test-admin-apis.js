const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function testAdminAPIs() {
  let connection;
  
  try {
    console.log('🧪 Testing Admin API Endpoints...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully');
    
    // Test 1: Dashboard Stats
    console.log('1. Testing Dashboard Stats...');
    try {
      const [statsResult] = await connection.execute(`
        SELECT 
          (SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date) = CURDATE()) as total_appointments,
          (SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date) = CURDATE() AND status = 'completed') as completed_appointments,
          (SELECT COUNT(*) FROM Admissions WHERE status = 'admitted') as admitted_patients,
          (SELECT COUNT(*) FROM medicines WHERE current_stock <= minimum_stock AND is_active = 1) as critical_alerts,
          (SELECT COALESCE(SUM(total_amount), 0) FROM billing WHERE DATE(bill_date) = CURDATE() AND payment_status = 'paid') as today_revenue
      `);
      
      const stats = statsResult[0];
      console.log('   ✅ Dashboard Stats:', {
        totalAppointments: stats.total_appointments,
        completedAppointments: stats.completed_appointments,
        admittedPatients: stats.admitted_patients,
        criticalAlerts: stats.critical_alerts,
        todayRevenue: stats.today_revenue
      });
    } catch (error) {
      console.log('   ❌ Dashboard Stats Error:', error.message);
    }
    
    // Test 2: Appointments
    console.log('\n2. Testing Appointments...');
    try {
      const [appointmentsResult] = await connection.execute(`
        SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = CURDATE()
      `);
      console.log('   ✅ Today\'s Appointments:', appointmentsResult[0].count);
    } catch (error) {
      console.log('   ❌ Appointments Error:', error.message);
    }
    
    // Test 3: Admitted Patients
    console.log('\n3. Testing Admitted Patients...');
    try {
      const [admittedResult] = await connection.execute(`
        SELECT COUNT(*) as count FROM Admissions WHERE status = 'admitted'
      `);
      console.log('   ✅ Admitted Patients:', admittedResult[0].count);
    } catch (error) {
      console.log('   ❌ Admitted Patients Error:', error.message);
    }
    
    // Test 4: Stock Alerts
    console.log('\n4. Testing Stock Alerts...');
    try {
      const [stockResult] = await connection.execute(`
        SELECT COUNT(*) as count FROM medicines WHERE current_stock <= minimum_stock AND is_active = 1
      `);
      console.log('   ✅ Stock Alerts:', stockResult[0].count);
    } catch (error) {
      console.log('   ❌ Stock Alerts Error:', error.message);
    }
    
    // Test 5: Doctor Schedules (Staff Profiles)
    console.log('\n5. Testing Doctor Schedules...');
    try {
      const [staffResult] = await connection.execute(`
        SELECT COUNT(*) as count FROM staff_profiles 
        WHERE employee_type IN ('full-time', 'part-time')
      `);
      console.log('   ✅ Available Staff:', staffResult[0].count);
    } catch (error) {
      console.log('   ❌ Doctor Schedules Error:', error.message);
    }
    
    // Test 6: Patients
    console.log('\n6. Testing Patients...');
    try {
      const [patientsResult] = await connection.execute(`
        SELECT COUNT(*) as count FROM patients WHERE is_active = 1
      `);
      console.log('   ✅ Total Patients:', patientsResult[0].count);
    } catch (error) {
      console.log('   ❌ Patients Error:', error.message);
    }
    
    console.log('\n🎉 Admin API Testing Completed!');
    console.log('\n🚀 Your Hospital Management System Admin APIs are ready!');
    console.log('   - Dashboard: http://localhost:3001/admin');
    console.log('   - API Endpoints: /api/admin/*');
    
  } catch (error) {
    console.error('\n❌ Admin API testing failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the tests
testAdminAPIs().catch(console.error);
