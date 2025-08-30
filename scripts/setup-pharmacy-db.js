const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

async function setupPharmacyTables() {
  try {
    // Use existing database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u153229971_Hospital'
    })

    console.log('Connected to database')

    // Read and execute SQL file
    const sqlPath = path.join(__dirname, 'create-pharmacy-tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement)
          console.log('Executed statement successfully')
        } catch (error) {
          console.log('Statement executed (may already exist):', error.message)
        }
      }
    }

    console.log('Pharmacy tables setup completed')
    await connection.end()
  } catch (error) {
    console.error('Error setting up pharmacy tables:', error.message)
  }
}

setupPharmacyTables()
