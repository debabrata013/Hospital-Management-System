require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Check:');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost (default)');
console.log('DB_USER:', process.env.DB_USER || 'root (default)');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('DB_NAME:', process.env.DB_NAME || 'hospital_management (default)');
console.log('DB_PORT:', process.env.DB_PORT || '3306 (default)');

// Test database connection
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

console.log('\n🔧 Database Config:', dbConfig);

async function testConnection() {
  try {
    console.log('\n🔌 Testing database connection...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully!');
    
    // Test a simple query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', result[0].test);
    
    await connection.end();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error number:', error.errno);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Make sure MySQL server is running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solution: Check username/password');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Solution: Database does not exist');
    }
  }
}

testConnection();
