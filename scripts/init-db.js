const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')

async function initializeDatabase() {
  try {
    // Create connection without database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    })

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'hospital_management'}`)
    console.log('Database created successfully')

    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'hospital_management'}`)

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../lib/db/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement)
      }
    }

    console.log('Database schema initialized successfully')
    await connection.end()
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

initializeDatabase()
