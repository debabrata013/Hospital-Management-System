const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function simpleDateTest() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Get all appointments for doctor 22 with their dates
    const [appointments] = await connection.execute(`
      SELECT id, appointment_id, appointment_date
      FROM appointments 
      WHERE doctor_id = 22
      ORDER BY appointment_date
    `);

    console.log(`\nFound ${appointments.length} appointments for doctor 22:`);
    appointments.forEach(apt => {
      const date = new Date(apt.appointment_date);
      console.log(`ID: ${apt.id}, Date: ${apt.appointment_date}, Local: ${date.toLocaleDateString()}`);
    });

    // Test the exact query that's failing
    console.log('\n--- Testing exact API query ---');
    const [apiTest] = await connection.execute(`
      SELECT id, appointment_id, appointment_date
      FROM appointments 
      WHERE doctor_id = ? AND DATE(appointment_date) = ?
    `, [22, '2025-09-15']);

    console.log(`API query result: ${apiTest.length} appointments found`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

simpleDateTest();
