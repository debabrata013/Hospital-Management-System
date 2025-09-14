const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function fixEmptyAppointmentStatus() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Check for appointments with empty or null status
    const [emptyStatus] = await connection.execute(
      `SELECT id, appointment_id, status FROM appointments WHERE status = '' OR status IS NULL`
    );

    console.log(`Found ${emptyStatus.length} appointments with empty status`);

    if (emptyStatus.length > 0) {
      // Update empty status to 'scheduled'
      const [updateResult] = await connection.execute(
        `UPDATE appointments SET status = 'scheduled' WHERE status = '' OR status IS NULL`
      );

      console.log(`Updated ${updateResult.affectedRows} appointments to 'scheduled' status`);
    }

    // Verify the fix
    const [stillEmpty] = await connection.execute(
      `SELECT COUNT(*) as count FROM appointments WHERE status = '' OR status IS NULL`
    );

    console.log(`Remaining appointments with empty status: ${stillEmpty[0].count}`);

    console.log('✅ Appointment status fix completed successfully');

  } catch (error) {
    console.error('❌ Error fixing appointment status:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixEmptyAppointmentStatus();
