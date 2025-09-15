const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function debugQueueUpdate() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check appointments table structure
    console.log('📋 Checking appointments table structure...');
    const [columns] = await connection.execute('DESCRIBE appointments');
    console.log('Columns:', columns.map(col => col.Field));
    
    // Check if there are any appointments
    console.log('\n📅 Checking appointments...');
    const [appointments] = await connection.execute(
      'SELECT id, appointment_id, patient_id, status FROM appointments LIMIT 5'
    );
    
    if (appointments.length === 0) {
      console.log('❌ No appointments found in database');
    } else {
      console.log('✅ Found appointments:');
      appointments.forEach(apt => {
        console.log(`  ID: ${apt.id}, Appointment ID: ${apt.appointment_id}, Status: ${apt.status}`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugQueueUpdate();
