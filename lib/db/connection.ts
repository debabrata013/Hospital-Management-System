import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

let pool: mysql.Pool | null = null

export function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function executeQuery(query: string, params: any[] = []) {
  const connection = getConnection()
  try {
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function closeConnection() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
