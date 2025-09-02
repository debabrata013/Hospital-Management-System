const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hospital_management',
  port: 3306
};

async function testAppointmentsAPI() {
  try {
    console.log('🔍 Testing appointments API...');
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');
    
    // Check if appointments table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "appointments"');
    console.log('📋 Appointments table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check table structure
      const [columns] = await connection.execute('DESCRIBE appointments');
      console.log('📊 Appointments table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
      
      // Check if there's data
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM appointments');
      console.log('📈 Total appointments:', count[0].total);
      
      if (count[0].total > 0) {
        const [sample] = await connection.execute('SELECT * FROM appointments LIMIT 1');
        console.log('📝 Sample appointment:', sample[0]);
      }
    }
    
    // Check if patients table exists
    const [patientTables] = await connection.execute('SHOW TABLES LIKE "patients"');
    console.log('👥 Patients table exists:', patientTables.length > 0);
    
    // Check if users table exists
    const [userTables] = await connection.execute('SHOW TABLES LIKE "users"');
    console.log('👤 Users table exists:', userTables.length > 0);
    
    await connection.end();
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAppointmentsAPI();
