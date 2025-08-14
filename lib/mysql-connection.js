// MySQL Database Connection Configuration for Hostinger
// Hospital Management System - Arogya Hospital

import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '148.222.53.8',
  user: process.env.DB_USER || 'hospital',
  password: process.env.DB_PASSWORD || 'Hospital2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+05:30', // IST timezone
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: false // Hostinger typically doesn't require SSL for internal connections
};

// Connection pool for better performance
let pool = null;

// Initialize connection pool
function initializePool() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    });

    // Handle pool events
    pool.on('connection', (connection) => {
      console.log('New MySQL connection established as id ' + connection.threadId);
    });

    pool.on('error', (err) => {
      console.error('MySQL pool error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        initializePool(); // Reinitialize pool on connection lost
      } else {
        throw err;
      }
    });
  }
  return pool;
}

// Get database connection
export async function getConnection() {
  try {
    if (!pool) {
      initializePool();
    }
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Error getting MySQL connection:', error);
    throw error;
  }
}

// Execute query with connection handling
export async function executeQuery(query, params = []) {
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Execute multiple queries in a transaction
export async function executeTransaction(queries) {
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

// Test database connection
export async function testConnection() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    connection.release();
    console.log('✅ MySQL database connection successful');
    return true;
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error.message);
    return false;
  }
}

// Close all connections
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MySQL connection pool closed');
  }
}

// Database utility functions
export const dbUtils = {
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
