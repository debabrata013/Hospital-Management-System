require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function verifySchema() {
  let connection;
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set. Please check your .env.local file.');
    process.exit(1);
  }

  try {
    console.log('Connecting to the database...');
    connection = await mysql.createConnection(connectionString);
    console.log('✅ Database connection successful.');

    console.log('\n--- Describing `appointments` table ---');
    const [appointmentsColumns] = await connection.execute('DESCRIBE appointments');
    console.table(appointmentsColumns);

    console.log('\n--- Describing `prescriptions` table ---');
    const [prescriptionsColumns] = await connection.execute('DESCRIBE prescriptions');
    console.table(prescriptionsColumns);

  } catch (error) {
    console.error('❌ An error occurred while verifying the schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

verifySchema();
