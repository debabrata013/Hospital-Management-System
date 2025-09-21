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
    // Check existing columns
    const [cols] = await conn.query("SHOW COLUMNS FROM admissions");
    const fields = new Set(cols.map(c => c.Field));

    const statements = [];
    if (!fields.has('room_type')) {
      statements.push("ALTER TABLE admissions ADD COLUMN room_type VARCHAR(50) NULL AFTER room_id");
    }
    if (!fields.has('bed_number')) {
      // Keep manual_bed_number for manual entries, add canonical bed_number for structured cases
      statements.push("ALTER TABLE admissions ADD COLUMN bed_number VARCHAR(50) NULL AFTER manual_room_number");
    }

    if (statements.length === 0) {
      console.log('No changes needed. Columns already exist.');
    } else {
      for (const stmt of statements) {
        console.log('Executing:', stmt);
        await conn.execute(stmt);
      }
      console.log('Admissions columns added successfully.');
    }
  } catch (e) {
    console.error('ALTER error:', e.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
