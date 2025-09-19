/*
  Migration: Add manual room/bed fields for admissions and bed_assignments
  - admissions: manual_room_number, manual_bed_number
  - bed_assignments: bed_number
  - index: admissions(manual_room_number)
*/
const mysql = require('mysql2/promise')

async function main() {
  const dbConfig = {
    host: process.env.DB_HOST || 'srv2047.hstgr.io',
    user: process.env.DB_USER || 'u153229971_admin',
    password: process.env.DB_PASSWORD || 'Admin!2025',
    database: process.env.DB_NAME || 'u153229971_Hospital',
    port: parseInt(process.env.DB_PORT || '3306'),
    charset: 'utf8mb4',
    timezone: '+05:30',
    connectTimeout: 20000,
  }

  const conn = await mysql.createConnection(dbConfig)
  try {
    console.log('Connected to DB:', dbConfig.host, dbConfig.database)

    // helpers
    async function columnExists(table, column) {
      const [rows] = await conn.execute(
        `SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
        [dbConfig.database, table, column]
      )
      return Array.isArray(rows) && rows.length > 0
    }

    async function addColumnIfMissing(table, column, ddl) {
      if (await columnExists(table, column)) {
        console.log(`Column exists: ${table}.${column}`)
        return
      }
      console.log(`Adding column ${table}.${column} ...`)
      await conn.execute(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
      console.log(`Added column ${table}.${column}`)
    }

    async function indexExists(table, index) {
      const [rows] = await conn.execute(
        `SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1`,
        [dbConfig.database, table, index]
      )
      return Array.isArray(rows) && rows.length > 0
    }

    async function addIndexIfMissing(table, index, ddl) {
      if (await indexExists(table, index)) {
        console.log(`Index exists: ${table}.${index}`)
        return
      }
      console.log(`Creating index ${table}.${index} ...`)
      await conn.execute(ddl)
      console.log(`Created index ${table}.${index}`)
    }

    async function isColumnNullable(table, column) {
      const [rows] = await conn.execute(
        `SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
        [dbConfig.database, table, column]
      )
      if (!Array.isArray(rows) || rows.length === 0) return null
      return rows[0].IS_NULLABLE === 'YES'
    }

    async function setColumnNullable(table, column, definitionIfUnknown = 'INT') {
      const nullable = await isColumnNullable(table, column)
      if (nullable === null) {
        console.warn(`Column not found for nullability change: ${table}.${column}`)
        return
      }
      if (nullable) {
        console.log(`Column already NULLable: ${table}.${column}`)
        return
      }
      console.log(`Altering ${table}.${column} to NULL ...`)
      // Determine data type
      const [rows] = await conn.execute(
        `SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
        [dbConfig.database, table, column]
      )
      const columnType = rows[0]?.COLUMN_TYPE || definitionIfUnknown
      await conn.execute(`ALTER TABLE ${table} MODIFY COLUMN ${column} ${columnType} NULL`)
      console.log(`Altered ${table}.${column} to NULL`)
    }

    // admissions
    await addColumnIfMissing('admissions', 'manual_room_number', 'manual_room_number VARCHAR(50) NULL AFTER room_id')
    await addColumnIfMissing('admissions', 'manual_bed_number', 'manual_bed_number VARCHAR(50) NULL AFTER manual_room_number')
    await addIndexIfMissing('admissions', 'idx_admissions_manual_room', 'CREATE INDEX idx_admissions_manual_room ON admissions (manual_room_number)')
  await setColumnNullable('admissions', 'room_id')

    // bed_assignments
    await addColumnIfMissing('bed_assignments', 'bed_number', 'bed_number VARCHAR(50) NULL AFTER room_id')
  await setColumnNullable('bed_assignments', 'room_id')

    console.log('Migration completed successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await conn.end()
  }
}

main()
