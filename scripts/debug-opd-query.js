const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function testOpdQuery() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    const doctorId = 22;
    const date = '2025-09-15';

    const query = `
      SELECT 
        id, 
        appointment_id,
        appointment_date,
        appointment_time,
        status
      FROM appointments 
      WHERE doctor_id = ? AND DATE(appointment_date) = ?
    `;

    console.log('Executing query:', query);
    console.log('With params:', [doctorId, date]);

    const [rows] = await connection.execute(query, [doctorId, date]);

    console.log('\n--- Query Results ---');
    if (rows.length > 0) {
      console.log(`✅ Found ${rows.length} appointments:`);
      console.table(rows);
    } else {
      console.log('❌ No appointments found for the given criteria.');
    }

  } catch (error) {
    console.error('❌ An error occurred:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Connection closed.');
    }
  }
}

testOpdQuery();
