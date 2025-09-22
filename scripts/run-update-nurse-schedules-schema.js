// Run the nurse_schedules schema migration safely
// Usage: node scripts/run-update-nurse-schedules-schema.js

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const {
    DB_HOST = 'localhost',
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = 'hospital_management',
    DB_PORT = '3306'
  } = process.env;

  const sqlPath = path.join(__dirname, 'sql', 'update-nurse-schedules-schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  let connection;
  try {
    console.log('🔄 Connecting to DB:', DB_HOST, DB_NAME);
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: Number(DB_PORT),
      multipleStatements: true
    });

    console.log('✅ Connected. Running migration...');
    await connection.query(sql);
    console.log('🎉 Migration completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed.');
    }
  }
}

run();
