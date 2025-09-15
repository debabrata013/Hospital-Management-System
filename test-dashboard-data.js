const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function testDashboardData() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const today = new Date().toISOString().split('T')[0];
    
    console.log('🔍 Testing Dashboard Data Sources...');
    console.log('Today:', today);
    
    // Test appointments data
    console.log('\n📅 APPOINTMENTS DATA:');
    const [todayAppointments] = await connection.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE DATE(appointment_date) = ?',
      [today]
    );
    console.log(`Total appointments today: ${todayAppointments[0].total}`);
    
    const [scheduledAppointments] = await connection.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = ? AND status IN ("scheduled", "confirmed", "in-progress")',
      [today]
    );
    console.log(`OPD appointments today: ${scheduledAppointments[0].count}`);
    
    const [completedAppointments] = await connection.execute(
      'SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = ? AND status = "completed"',
      [today]
    );
    console.log(`Completed appointments today: ${completedAppointments[0].count}`);
    
    // Test recent appointments
    console.log('\n📋 RECENT APPOINTMENTS:');
    const [recentAppointments] = await connection.execute(
      'SELECT appointment_id, patient_id, status, appointment_date FROM appointments ORDER BY created_at DESC LIMIT 5'
    );
    recentAppointments.forEach(apt => {
      console.log(`  ${apt.appointment_id}: ${apt.patient_id} - ${apt.status} (${apt.appointment_date})`);
    });
    
    // Test 7-day data
    console.log('\n📊 LAST 7 DAYS DATA:');
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const [dayAppointments] = await connection.execute(
        'SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = ?',
        [dateStr]
      );
      
      console.log(`  ${dayName} (${dateStr}): ${dayAppointments[0].count} appointments`);
    }
    
    await connection.end();
    console.log('\n✅ Data test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDashboardData();
