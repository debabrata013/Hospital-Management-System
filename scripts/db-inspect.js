#!/usr/bin/env node
const mysql = require('mysql2/promise');

(async () => {
  const dbConfig = {
    host: process.env.DB_HOST || 'srv2047.hstgr.io',
    user: process.env.DB_USER || 'u153229971_admin',
    password: process.env.DB_PASSWORD || 'Admin!2025',
    database: process.env.DB_NAME || 'u153229971_Hospital',
    port: parseInt(process.env.DB_PORT || '3306'),
    charset: 'utf8mb4',
    timezone: '+05:30',
    connectTimeout: 20000
  };
  const conn = await mysql.createConnection(dbConfig);
  try {
    const [v] = await conn.query('SELECT VERSION() AS version');
    console.log('MySQL version:', v[0].version);

    for (const table of ['admissions', 'rooms', 'bed_assignments']) {
      try {
        const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
        console.log(`${table} columns:`, cols.map(c => c.Field));
      } catch (e) {
        console.log(`${table} SHOW COLUMNS error:`, e.message);
      }
    }
  } catch (e) {
    console.error('inspect error:', e.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
