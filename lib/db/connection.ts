import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectTimeout: 30000,
  acquireTimeout: 30000,
  waitForConnections: true,
  connectionLimit: 3,
  maxIdle: 2,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
}

// Augment the global type to include our custom database pool
declare global {
  var mysqlPool: mysql.Pool | undefined;
}

let pool: mysql.Pool;

if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool(dbConfig);
} else {
  if (!global.mysqlPool) {
    global.mysqlPool = mysql.createPool(dbConfig);
  }
  pool = global.mysqlPool;
}

export function getConnection() {
  return pool;
}

export async function executeQuery(query: string, params: any[] = []) {
  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    // Retry logic for connection issues
    if (error instanceof Error && (
      error.message.includes('ECONNRESET') || 
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('Connection lost')
    )) {
      console.log('Retrying database query due to connection issue...');
      try {
        if (connection) connection.release();
        connection = await pool.getConnection();
        const [results] = await connection.execute(query, params);
        return results;
      } catch (retryError) {
        console.error('Database retry failed:', retryError);
        throw retryError;
      }
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
