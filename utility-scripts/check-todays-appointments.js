require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  process.exit(1);
}

async function checkTodaysAppointments() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(connectionString);
    
    console.log('Checking for all appointments for today...');

    const today = new Date().toISOString().split('T')[0];

    const [appointments] = await connection.execute(`
      SELECT a.id, a.appointment_id, a.department, a.appointment_date, a.status, p.name as patient_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE DATE(a.appointment_date) = ? 
      ORDER BY a.created_at DESC
    `, [today]);

    if (appointments.length > 0) {
      console.log(`\n📊 Found ${appointments.length} appointments for today (${today}):`);
      console.log(JSON.stringify(appointments, null, 2));
    } else {
      console.log(`\n- No appointments found for today (${today}).`);
    }

  } catch (error) {
    console.error('❌ Error checking appointments:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
checkTodaysAppointments()
  .then(() => {
    console.log('\n✅ Todays appointment check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Todays appointment check failed:', error);
    process.exit(1);
  });
