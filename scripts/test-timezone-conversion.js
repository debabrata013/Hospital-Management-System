const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function testTimezoneConversion() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    const doctorId = 22;

    // First, let's see the raw appointment_date values
    console.log('\n--- Raw appointment dates for doctor 22 ---');
    const [rawDates] = await connection.execute(`
      SELECT id, appointment_id, appointment_date, 
             DATE(appointment_date) as date_part
      FROM appointments 
      WHERE doctor_id = ?
    `, [doctorId]);

    console.table(rawDates);

    // Test searching for 2025-09-15 (what the UI is sending)
    console.log('\n--- Testing search for 2025-09-15 ---');
    const [results15] = await connection.execute(`
      SELECT id, appointment_id, appointment_date
      FROM appointments 
      WHERE doctor_id = ? AND DATE(appointment_date) = ?
    `, [doctorId, '2025-09-15']);

    console.log(`Found ${results15.length} appointments for 2025-09-15`);
    if (results15.length > 0) {
      console.table(results15);
    }

    // Test searching for 2025-09-14 (what the database actually has)
    console.log('\n--- Testing search for 2025-09-14 ---');
    const [results14] = await connection.execute(`
      SELECT id, appointment_id, appointment_date
      FROM appointments 
      WHERE doctor_id = ? AND DATE(appointment_date) = ?
    `, [doctorId, '2025-09-14']);

    console.log(`Found ${results14.length} appointments for 2025-09-14`);
    if (results14.length > 0) {
      console.table(results14);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testTimezoneConversion();
