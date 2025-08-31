require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function testAppointmentsSetup() {
  let connection;
  
  try {
    console.log('🔍 Testing database connection...');
    console.log('Config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Test basic query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Basic query successful:', result);

    // Check if appointments table exists
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'appointments'
    `);
    
    if (tables.length > 0) {
      console.log('✅ Appointments table already exists');
      
      // Check table structure
      const [columns] = await connection.execute('DESCRIBE appointments');
      console.log('📋 Appointments table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Check sample data
      const [appointments] = await connection.execute('SELECT COUNT(*) as count FROM appointments');
      console.log(`📊 Found ${appointments[0].count} appointments`);
      
    } else {
      console.log('❌ Appointments table does not exist');
    }

    console.log('🎉 Appointments setup test completed!');
    
  } catch (error) {
    console.error('❌ Error testing appointments setup:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testAppointmentsSetup();
