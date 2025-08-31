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

async function checkDashboardTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check if specific tables exist
    const tableNames = ['admissions', 'beds', 'inventory', 'payments', 'patients'];
    
    for (const tableName of tableNames) {
      const [tableExists] = await connection.execute(`SHOW TABLES LIKE '${tableName}'`);
      if (tableExists.length > 0) {
        console.log(`✅ Table '${tableName}' exists`);
        // Show structure
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`  Structure of ${tableName}:`);
        columns.forEach(col => {
          console.log(`    - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      } else {
        console.log(`❌ Table '${tableName}' does not exist`);
      }
    }

    console.log('🎉 Dashboard tables check completed!');
    
  } catch (error) {
    console.error('❌ Error checking dashboard tables:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

checkDashboardTables();
