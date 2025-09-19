const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDoctorDepartment() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'u153229971_Hospital',
      port: process.env.DB_PORT || 3306
    });

    const doctorId = 22;
    const newDepartment = 'Cardiology';

    console.log(`Attempting to update department for doctor ID: ${doctorId} to '${newDepartment}'...`);

    // Check current department
    const [beforeUpdate] = await connection.execute(
      'SELECT `id`, `name`, `department` FROM `users` WHERE `id` = ?',
      [doctorId]
    );

    if (!beforeUpdate.length) {
      console.error(`Error: Doctor with ID ${doctorId} not found.`);
      return;
    }

    console.log('Before update:', beforeUpdate[0]);

    // Update the department
    const [result] = await connection.execute(
      'UPDATE `users` SET `department` = ? WHERE `id` = ?',
      [newDepartment, doctorId]
    );

    if (result.affectedRows > 0) {
      console.log(`\n✅ Successfully updated department for doctor ID: ${doctorId}.`);
    } else {
      console.log('\n⚠️ No changes were made. The department might have been the same.');
    }

    // Verify the update
    const [afterUpdate] = await connection.execute(
      'SELECT `id`, `name`, `department` FROM `users` WHERE `id` = ?',
      [doctorId]
    );

    console.log('After update:', afterUpdate[0]);

  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

updateDoctorDepartment();
