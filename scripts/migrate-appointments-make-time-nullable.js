require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function migrate() {
  let conn;
  try {
    console.log('Connecting to DB...');
    conn = await mysql.createConnection(dbConfig);

    // Make appointment_time nullable
    console.log('Altering appointments.appointment_time to be NULLABLE...');
    await conn.execute(`
      ALTER TABLE appointments 
      MODIFY COLUMN appointment_time TIME NULL;
    `);

    // Ensure status values are lower-case variants if needed
    console.log('Normalizing appointments.status values to lower-case known set...');
    await conn.execute(`
      UPDATE appointments 
      SET status = LOWER(status)
      WHERE status IN ('Scheduled','Completed','Cancelled','No Show');
    `);

    // Optional: add index on users.department to speed department filter
    console.log('Adding index on users.department (if not exists)...');
    await conn.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
    `).catch(() => {});

    // Verify nullability
    const [verifyRows] = await conn.execute(
      `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'appointment_time'`,
      [dbConfig.database]
    );
    const isNullable = Array.isArray(verifyRows) && verifyRows[0] && verifyRows[0].IS_NULLABLE;
    console.log(`Verification: appointments.appointment_time IS_NULLABLE = ${isNullable}`);

    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
