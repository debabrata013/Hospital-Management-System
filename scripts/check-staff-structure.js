require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function checkStaffStructure() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking staff_profiles table structure...');

    // Get table structure
    const [columns] = await connection.execute(`
      DESCRIBE staff_profiles
    `);

    console.log('\n📋 staff_profiles table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Get sample data
    const [sampleData] = await connection.execute(`
      SELECT * FROM staff_profiles LIMIT 3
    `);

    if (sampleData.length > 0) {
      console.log('\n📊 Sample staff_profiles data:');
      console.log(JSON.stringify(sampleData, null, 2));
    } else {
      console.log('\n📊 No data in staff_profiles table');
    }

    // Check users with role doctor
    const [doctors] = await connection.execute(`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      WHERE u.role = 'doctor'
    `);

    console.log('\n👨‍⚕️ Users with doctor role:');
    doctors.forEach(doctor => {
      console.log(`- ${doctor.name} (${doctor.email}) - ${doctor.role}`);
    });

  } catch (error) {
    console.error('❌ Error checking staff structure:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
checkStaffStructure()
  .then(() => {
    console.log('\n✅ Staff structure check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Staff structure check failed:', error);
    process.exit(1);
  });
