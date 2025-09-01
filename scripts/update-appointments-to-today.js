const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function updateAppointmentsToToday() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Update existing appointments to today's date with different times
    const updates = [
      { id: 35, time: '09:30:00' },
      { id: 36, time: '10:15:00' }
    ];

    for (const update of updates) {
      const query = `
        UPDATE appointments 
        SET appointment_date = ?
        WHERE id = ?
      `;
      
      await connection.execute(query, [
        `${todayStr} ${update.time}`,
        update.id
      ]);
    }

    console.log('✅ Appointments updated to today successfully!');
    console.log(`📅 Updated appointments for today (${todayStr})`);

  } catch (error) {
    console.error('❌ Error updating appointments:', error);
  } finally {
    await connection.end();
  }
}

updateAppointmentsToToday();
