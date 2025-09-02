process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('Starting migration script...');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
console.log('dotenv configured.');

const mysql = require('mysql2/promise');

async function runMigration() {
  let connection;
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set. Please check your .env.local file.');
    process.exit(1);
  }

  try {
        console.log('Attempting to connect to the database...');
    try {
      connection = await mysql.createConnection(connectionString);
      console.log('✅ Database connection successful.');
    } catch (connectionError) {
      console.error('❌ Failed to connect to the database:', connectionError);
      process.exit(1);
    }

    // Add 'chief_complaint' to 'appointments' if it doesn't exist
    console.log("Checking for 'chief_complaint' column in 'appointments' table...");
    const [chiefComplaintCols] = await connection.execute("SHOW COLUMNS FROM appointments LIKE 'chief_complaint'");
    if (chiefComplaintCols.length === 0) {
        console.log("'chief_complaint' column not found. Adding it...");
        await connection.execute('ALTER TABLE appointments ADD COLUMN chief_complaint VARCHAR(255)');
        console.log("✅ 'chief_complaint' column added.");
    } else {
        console.log("👍 'chief_complaint' column already exists.");
    }

    // Add 'diagnosis' to 'appointments' if it doesn't exist
    console.log("Checking for 'diagnosis' column in 'appointments' table...");
    const [diagnosisCols] = await connection.execute("SHOW COLUMNS FROM appointments LIKE 'diagnosis'");
    if (diagnosisCols.length === 0) {
        console.log("'diagnosis' column not found. Adding it...");
        await connection.execute('ALTER TABLE appointments ADD COLUMN diagnosis TEXT');
        console.log("✅ 'diagnosis' column added.");
    } else {
        console.log("👍 'diagnosis' column already exists.");
    }

    // Add 'final_diagnosis' to 'prescriptions' if it doesn't exist
    console.log("Checking for 'final_diagnosis' column in 'prescriptions' table...");
    const [finalDiagnosisCols] = await connection.execute("SHOW COLUMNS FROM prescriptions LIKE 'final_diagnosis'");
    if (finalDiagnosisCols.length === 0) {
        console.log("'final_diagnosis' column not found. Adding it...");
        await connection.execute('ALTER TABLE prescriptions ADD COLUMN final_diagnosis TEXT');
        console.log("✅ 'final_diagnosis' column added.");
    } else {
        console.log("👍 'final_diagnosis' column already exists.");
    }

  } catch (error) {
    console.error('❌ An error occurred during migration:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

runMigration();
