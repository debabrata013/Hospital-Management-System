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
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Add SSL configuration for production (conditionally)
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false
    }
  })
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
  try {
    if (!pool) {
      console.log('[DB] Creating new database pool...');
      pool = createPool();
    }
    
    // Validate pool is properly initialized
    if (!pool || typeof pool.getConnection !== 'function') {
      console.error('[DB] Pool is not properly initialized, recreating...');
      pool = createPool();
    }
    
    return pool;
  } catch (error) {
    console.error('[DB] Error getting connection pool:', error);
    throw new Error(`Failed to get database connection pool: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeQuery(
  query: string,
  params: any[] = [],
  options: { allowDuringBuild?: boolean } = {}
) {
  console.log('[DB] executeQuery called with query:', query.substring(0, 100) + '...');
  console.log('[DB] executeQuery params:', params);
  console.log('[DB] NEXT_PHASE:', process.env.NEXT_PHASE);
  console.log('[DB] NEXT_STATIC_BUILD:', process.env.NEXT_STATIC_BUILD);
  
  // Ensure params is always an array to prevent undefined errors
  const safeParams = Array.isArray(params) ? params : [];
  
  const { allowDuringBuild = false } = options;
  // During build time, return empty results to prevent build failures unless explicitly allowed
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  
  console.log('[DB] isBuildPhase:', isBuildPhase);
  console.log('[DB] allowDuringBuild:', allowDuringBuild);
  
  if (!allowDuringBuild && isBuildPhase) {
    console.log('[DB] Build time detected, returning empty results for query:', query.substring(0, 50) + '...');
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

      // Validate connection before use
      if (typeof connection.execute !== 'function') {
        throw new Error('Invalid database connection - execute method not available');
      }

      console.log('[DB] Executing query:', query.substring(0, 100) + '...');
      console.log('[DB] With params:', safeParams);
      
      // Use safeParams instead of params to ensure it's always an array
      const [results] = await connection.execute(query, safeParams);
      
      console.log('[DB] Query results:', results);
      console.log('[DB] Results type:', typeof results);
      console.log('[DB] Results length:', Array.isArray(results) ? results.length : 'not array');
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
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
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
