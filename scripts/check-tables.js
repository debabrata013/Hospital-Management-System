require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    const connection = await mysql.createConnection(dbConfig);
    
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Tables in database:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    // Check specific tables that dashboard API needs
    const requiredTables = ['patients', 'appointments', 'users', 'billing'];
    
    console.log('\n🔍 Checking required tables for dashboard:');
    for (const tableName of requiredTables) {
      try {
        const [result] = await connection.execute(`SHOW TABLES LIKE '${tableName}'`);
        if (result.length > 0) {
          console.log(`✅ ${tableName} table exists`);
          
          // Check table structure
          const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
          console.log(`   Columns: ${columns.map(col => col.Field).join(', ')}`);
          
          // Check if table has data
          const [count] = await connection.execute(`SELECT COUNT(*) as total FROM ${tableName}`);
          console.log(`   Records: ${count[0].total}`);
        } else {
          console.log(`❌ ${tableName} table missing`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${tableName}:`, error.message);
      }
    }
    
    await connection.end();
    console.log('\n✅ Table check completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTables();
