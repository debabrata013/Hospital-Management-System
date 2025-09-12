// MySQL Database Connection Configuration for Hostinger
// Hospital Management System - NMSC

const mysql = require('mysql2/promise');

// Database configuration with fallback IP
const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+05:30', // IST timezone
  connectionLimit: 10,
  queueLimit: 0,
  ssl: false, // Hostinger typically doesn't require SSL for internal connections
  // DNS resolution timeout
  connectTimeout: 20000 // 20 seconds
};

// Fallback configuration with IP address
const fallbackDbConfig = {
  ...dbConfig,
  host: '148.222.53.8' // Direct IP address as fallback
};

// Connection pool for better performance
let pool = null;

// Initialize connection pool with retry logic
function initializePool() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        ...dbConfig,
        waitForConnections: true
      });

      // Handle pool events
      pool.on('connection', (connection) => {
        console.log('New MySQL connection established as id ' + connection.threadId);
      });

      pool.on('error', (err) => {
        console.error('MySQL pool error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ENOTFOUND') {
          console.log('Attempting to reinitialize pool with fallback configuration...');
          pool = null;
          initializePoolWithFallback();
        } else {
          throw err;
        }
      });

    } catch (error) {
      console.error('Failed to initialize primary pool, trying fallback:', error);
      initializePoolWithFallback();
    }
  }
  return pool;
}

// Initialize pool with fallback IP configuration
function initializePoolWithFallback() {
  if (!pool) {
    try {
      console.log('Initializing MySQL pool with fallback IP configuration...');
      pool = mysql.createPool({
        ...fallbackDbConfig,
        waitForConnections: true
      });

      pool.on('connection', (connection) => {
        console.log('New MySQL fallback connection established as id ' + connection.threadId);
      });

      pool.on('error', (err) => {
        console.error('MySQL fallback pool error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          pool = null;
          setTimeout(() => initializePoolWithFallback(), 5000); // Retry after 5 seconds
        } else {
          throw err;
        }
      });

    } catch (error) {
      console.error('Failed to initialize fallback pool:', error);
      throw error;
    }
  }
  return pool;
}

// Get database connection with retry logic
async function getConnection(retryCount = 0) {
  const maxRetries = 3;
  
  try {
    if (!pool) {
      initializePool();
    }
    
    const connection = await pool.getConnection();
    return connection;
    
  } catch (error) {
    console.error(`Error getting MySQL connection (attempt ${retryCount + 1}):`, error);
    
    // If DNS resolution fails, try with fallback IP
    if (error.code === 'ENOTFOUND' && retryCount < maxRetries) {
      console.log('DNS resolution failed, trying with fallback IP...');
      pool = null; // Reset pool
      initializePoolWithFallback();
      
      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return getConnection(retryCount + 1);
    }
    
    // General retry logic
    if (retryCount < maxRetries) {
      console.log(`Retrying connection in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return getConnection(retryCount + 1);
    }
    
    throw error;
  }
}

// Execute query with connection handling and retry logic
async function executeQuery(query, params = [], retryCount = 0) {
  const maxRetries = 2;
  let connection;
  
  try {
    connection = await getConnection();
    const [results] = await connection.execute(query, params);
    return results;
    
  } catch (error) {
    console.error('Error executing query:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    
    // Retry on connection errors
    if ((error.code === 'ENOTFOUND' || error.code === 'PROTOCOL_CONNECTION_LOST') && retryCount < maxRetries) {
      console.log(`Retrying query execution (attempt ${retryCount + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return executeQuery(query, params, retryCount + 1);
    }
    
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Execute multiple queries in a transaction
async function executeTransaction(queries) {
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params || []);
      results.push(result);
    }

    await connection.commit();
    return results;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Transaction error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Test database connection with both hostname and IP
async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    connection.release();
    console.log('✅ MySQL database connection successful');
    return true;
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error.message);
    
    // Try with fallback IP if hostname fails
    if (error.code === 'ENOTFOUND') {
      console.log('Trying fallback IP connection...');
      try {
        pool = null;
        initializePoolWithFallback();
        const connection = await getConnection();
        const [rows] = await connection.execute('SELECT 1 as test');
        connection.release();
        console.log('✅ MySQL fallback connection successful');
        return true;
      } catch (fallbackError) {
        console.error('❌ MySQL fallback connection also failed:', fallbackError.message);
        return false;
      }
    }
    
    return false;
  }
}

// Close all connections
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MySQL connection pool closed');
  }
}

// Database utility functions
const dbUtils = {
  // Generate unique ID for entities
  generateId: (prefix = 'ID') => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}${timestamp}${random}`.toUpperCase();
  },

  // Format date for MySQL
  formatDate: (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  // Format datetime for MySQL
  formatDateTime: (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  },

  // Escape string for SQL
  escapeString: (str) => {
    if (!str) return '';
    return str.replace(/'/g, "''");
  },

  // Build WHERE clause from object
  buildWhereClause: (conditions) => {
    if (!conditions || Object.keys(conditions).length === 0) {
      return { clause: '', params: [] };
    }

    const clauses = [];
    const params = [];

    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          clauses.push(`${key} IN (${value.map(() => '?').join(', ')})`);
          params.push(...value);
        } else if (typeof value === 'object' && value.operator) {
          clauses.push(`${key} ${value.operator} ?`);
          params.push(value.value);
        } else {
          clauses.push(`${key} = ?`);
          params.push(value);
        }
      }
    });

    return {
      clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
      params
    };
  },

  // Build INSERT query
  buildInsertQuery: (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    return {
      query: `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
      params: values
    };
  },

  // Build UPDATE query
  buildUpdateQuery: (table, data, conditions) => {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const { clause: whereClause, params: whereParams } = dbUtils.buildWhereClause(conditions);
    
    return {
      query: `UPDATE ${table} SET ${setClause} ${whereClause}`,
      params: [...Object.values(data), ...whereParams]
    };
  }
};

// Initialize pool on module load
initializePool();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing MySQL connection pool...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing MySQL connection pool...');
  await closePool();
  process.exit(0);
});

// Export functions
module.exports = {
  getConnection,
  executeQuery,
  executeTransaction,
  testConnection,
  closePool,
  dbUtils
};
