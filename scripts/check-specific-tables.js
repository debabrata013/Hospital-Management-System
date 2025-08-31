const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function checkSpecificTables() {
  let connection;
  
  try {
    console.log('🔍 Checking specific table structures...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully');
    
    // Check Admissions table
    console.log('📋 Admissions table structure:');
    try {
      const [admissionColumns] = await connection.execute('DESCRIBE Admissions');
      admissionColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log('   ❌ Admissions table not accessible:', error.message);
    }
    
    // Check staff_profiles table
    console.log('\n📋 Staff Profiles table structure:');
    try {
      const [staffColumns] = await connection.execute('DESCRIBE staff_profiles');
      staffColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.log('   ❌ Staff Profiles table not accessible:', error.message);
    }
    
    // Check if there are any sample records
    console.log('\n📊 Sample data check:');
    
    try {
      const [admissionSample] = await connection.execute('SELECT * FROM Admissions LIMIT 1');
      console.log('   - Admissions sample:', admissionSample.length > 0 ? 'Has data' : 'No data');
    } catch (error) {
      console.log('   - Admissions sample: Error accessing table');
    }
    
    try {
      const [staffSample] = await connection.execute('SELECT * FROM staff_profiles LIMIT 1');
      console.log('   - Staff sample:', staffSample.length > 0 ? 'Has data' : 'No data');
    } catch (error) {
      console.log('   - Staff sample: Error accessing table');
    }
    
  } catch (error) {
    console.error('\n❌ Table check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkSpecificTables().catch(console.error);
