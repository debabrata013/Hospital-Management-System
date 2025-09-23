require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  process.exit(1);
}

async function checkCardiologyAppointments() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(connectionString);
    
    console.log('Checking for Cardiology appointments for today...');

    const today = new Date().toISOString().split('T')[0];

    const [appointments] = await connection.execute(`
      SELECT id, appointment_id, department, appointment_date, status
      FROM appointments 
      WHERE department = 'Cardiology' AND DATE(appointment_date) = ? 
      ORDER BY created_at DESC
      LIMIT 10
    `, [today]);

    if (appointments.length > 0) {
      console.log(`\n📊 Found ${appointments.length} Cardiology appointments for today (${today}):`);
      console.log(JSON.stringify(appointments, null, 2));
    } else {
      console.log(`\n- No Cardiology appointments found for today (${today}).`);
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
checkCardiologyAppointments()
  .then(() => {
    console.log('\n✅ Cardiology appointment check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cardiology appointment check failed:', error);
    process.exit(1);
  });
