require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function checkAppointmentsStructure() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking appointments table structure...');

    // Get table structure
    const [columns] = await connection.execute(`
      DESCRIBE appointments
    `);

    console.log('\n📋 appointments table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });

    // Get sample data
    const [sampleData] = await connection.execute(`
      SELECT * FROM appointments LIMIT 3
    `);

    if (sampleData.length > 0) {
      console.log('\n📊 Sample appointments data:');
      console.log(JSON.stringify(sampleData, null, 2));
    } else {
      console.log('\n📊 No data in appointments table');
    }

    // Check if there are any existing appointments
    const [count] = await connection.execute(`
      SELECT COUNT(*) as count FROM appointments
    `);

    console.log(`\n📊 Total appointments: ${count[0].count}`);

  } catch (error) {
    console.error('❌ Error checking appointments structure:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
checkAppointmentsStructure()
  .then(() => {
    console.log('\n✅ Appointments structure check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Appointments structure check failed:', error);
    process.exit(1);
  });
