require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_PORT:', process.env.DB_PORT);
  
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    connectTimeout: 30000
  };

  let connection;
  try {
    console.log('Attempting to connect to remote database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connection established successfully!');
    
    // Test basic query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Basic query successful:', result);
    
    // Test patients table query
    const [patients] = await connection.execute('SELECT COUNT(*) as count FROM patients LIMIT 1');
    console.log('✅ Patients table query successful:', patients);
    
    console.log('🎉 All database tests passed!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - check if database server is running and accessible');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();
