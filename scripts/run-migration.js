#!/usr/bin/env node
/**
 * Simple migration runner for a single SQL file.
 * It reads the SQL from migrations/20250921_add_room_type_and_bed_number.sql
 * and executes it against the configured MySQL database.
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const sqlPath = path.resolve(__dirname, '../migrations/20250921_add_room_type_and_bed_number.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

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

  const connection = await mysql.createConnection(dbConfig);
  try {
    console.log('Applying migration:', path.basename(sqlPath));

    // Split into statements on semicolons, but ignore those inside strings.
    // For our simple file, naive split works fine.
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const stmt of statements) {
      console.log('Executing:', stmt.substring(0, 120) + (stmt.length > 120 ? '...' : ''));
      await connection.execute(stmt);
    }

    console.log('Migration applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

main();
