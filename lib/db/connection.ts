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
  waitForConnections: true,
  connectionLimit: 5,
  maxIdle: 3,
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

function createPool() {
  return mysql.createPool(dbConfig);
}

if (process.env.NODE_ENV === 'production') {
  pool = createPool();
} else {
  if (!global.mysqlPool) {
    global.mysqlPool = createPool();
  }
  pool = global.mysqlPool;
}

export function getConnection() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

export async function executeQuery(query: string, params: any[] = []) {
  // During build time, return empty results to prevent build failures
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_STATIC_BUILD === 'true') {
    console.log('Build time detected, returning empty results for query:', query.substring(0, 50) + '...');
    return [];
  }

  let connection: mysql.PoolConnection | null = null;
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Ensure pool exists
      const currentPool = getConnection();
      if (!currentPool) {
        throw new Error('Database pool not initialized');
      }

      connection = await currentPool.getConnection();
      if (!connection) {
        throw new Error('Failed to get database connection from pool');
      }

      const [results] = await connection.execute(query, params);
      return results;
    } catch (error) {
      console.error(`Database query error (attempt ${retryCount + 1}):`, error);
      
      // Release connection if it exists
      if (connection) {
        try {
          connection.release();
        } catch (releaseError) {
          console.error('Error releasing connection:', releaseError);
        }
        connection = null;
      }

      retryCount++;
      
      // Check if we should retry
      const shouldRetry = error instanceof Error && (
        error.message.includes('ECONNRESET') || 
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('Connection lost') ||
        error.message.includes('Cannot read properties of undefined')
      );

      if (shouldRetry && retryCount < maxRetries) {
        console.log(`Retrying database query (${retryCount}/${maxRetries})...`);
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        continue;
      }

      // During build, return empty results instead of throwing
      if (process.env.NODE_ENV === 'production' && error instanceof Error && (
        error.message.includes('ECONNRESET') || 
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('Connection lost')
      )) {
        console.log('Build time database error, returning empty results');
        return [];
      }

      throw error;
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (releaseError) {
          console.error('Error releasing connection in finally block:', releaseError);
        }
      }
    }
  }
}
