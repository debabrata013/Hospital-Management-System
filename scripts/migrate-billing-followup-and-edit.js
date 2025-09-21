require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function columnExists(conn, table, column) {
  const [rows] = await conn.execute(
    `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [dbConfig.database, table, column]
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function migrate() {
  let conn;
  try {
    console.log('Connecting to DB...');
    conn = await mysql.createConnection(dbConfig);

    const hasParent = await columnExists(conn, 'bills', 'parent_bill_id');
    if (!hasParent) {
      console.log('Adding parent_bill_id to bills...');
      await conn.execute(`
        ALTER TABLE bills
        ADD COLUMN parent_bill_id INT NULL AFTER appointment_id,
        ADD INDEX idx_bills_parent_bill_id (parent_bill_id),
        ADD CONSTRAINT fk_bills_parent
          FOREIGN KEY (parent_bill_id) REFERENCES bills(id)
          ON DELETE SET NULL
      `);
    } else {
      console.log('parent_bill_id already exists');
    }

    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
