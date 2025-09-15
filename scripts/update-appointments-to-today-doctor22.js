const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'u15322997_Hospital'
};

async function updateAppointmentsToToday() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    console.log('📅 Updating appointments to today:', todayStr);

    // Update all appointments for doctor_id 22 to today's date
    const updateQuery = `
      UPDATE appointments 
      SET appointment_date = ?
      WHERE doctor_id = 22
    `;

    const [result] = await connection.execute(updateQuery, [todayStr]);
    console.log('✅ Updated', result.affectedRows, 'appointments for doctor ID 22');

    // Show updated appointments
    const [appointments] = await connection.execute(`
      SELECT a.id, a.appointment_id, a.appointment_date, a.appointment_time, 
             a.status, p.name as patient_name
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      WHERE a.doctor_id = 22 AND a.appointment_date = ?
      ORDER BY a.appointment_time
    `, [todayStr]);

    console.log('\n📋 Updated appointments for today:');
    appointments.forEach(apt => {
      console.log(`   ${apt.appointment_time} - ${apt.patient_name} (${apt.status}) - ID: ${apt.appointment_id}`);
    });

    console.log('\n🎉 All appointments updated successfully!');
    console.log('Now login as doctor (9876543212/111111) to see them in the dashboard.');

  } catch (error) {
    console.error('❌ Error updating appointments:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateAppointmentsToToday();
