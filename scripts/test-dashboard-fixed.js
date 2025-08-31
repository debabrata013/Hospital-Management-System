require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function testDashboardFixed() {
  try {
    console.log('🔍 Testing fixed dashboard API...');
    const connection = await mysql.createConnection(dbConfig);
    
    // Test the exact queries from the fixed dashboard API
    console.log('\n📊 Testing dashboard queries...');
    
    // Test patients count
    const [patientsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM patients WHERE is_active = 1'
    );
    console.log('✅ Patients count:', patientsResult[0].total);
    
    // Test today's appointments
    const today = new Date().toISOString().split('T')[0];
    const [todayAppointmentsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE DATE(appointment_date) = ?',
      [today]
    );
    console.log('✅ Today appointments:', todayAppointmentsResult[0].total);
    
    // Test total appointments
    const [totalAppointmentsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments'
    );
    console.log('✅ Total appointments:', totalAppointmentsResult[0].total);
    
    // Test pending appointments
    const [pendingAppointmentsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE status = "scheduled"'
    );
    console.log('✅ Pending appointments:', pendingAppointmentsResult[0].total);
    
    // Test completed appointments
    const [completedAppointmentsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE status = "completed"'
    );
    console.log('✅ Completed appointments:', completedAppointmentsResult[0].total);
    
    // Test doctors count
    const [doctorsResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM users WHERE role LIKE "%doctor%" AND is_active = 1'
    );
    console.log('✅ Doctors count:', doctorsResult[0].total);
    
    // Test revenue
    const [revenueResult] = await connection.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM billing WHERE payment_status = "Paid"'
    );
    console.log('✅ Revenue:', revenueResult[0].total);
    
    // Test recent appointments
    const [recentAppointments] = await connection.execute(
      `SELECT 
        a.appointment_id, a.appointment_date, a.appointment_time, a.appointment_type, a.status,
        p.name as patient_name, p.patient_id as patient_number,
        u.name as doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u ON a.doctor_id = u.id
       WHERE DATE(a.appointment_date) >= ?
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 5`,
      [today]
    );
    console.log('✅ Recent appointments:', recentAppointments.length);
    
    await connection.end();
    console.log('\n✅ All dashboard queries working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDashboardFixed();
