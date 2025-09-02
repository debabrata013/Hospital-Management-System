const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306'),
  multipleStatements: true
};

async function initializeDoctorsDB() {
  let connection;
  
  try {
    console.log('🏥 Initializing Doctors Database...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'init-doctors-db.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Execute the SQL
    await connection.execute(sql);
    console.log('✅ Database schema initialized');
    
    // Verify the setup
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    if (tables.length > 0) {
      console.log('✅ Users table exists');
      
      // Check columns
      const [columns] = await connection.execute("DESCRIBE users");
      const columnNames = columns.map(col => col.Field);
      
      const requiredColumns = [
        'id', 'user_id', 'name', 'email', 'password_hash', 'role',
        'contact_number', 'specialization', 'qualification', 'experience_years',
        'license_number', 'department', 'is_active', 'is_verified'
      ];
      
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ All required columns exist');
      } else {
        console.log('⚠️  Missing columns:', missingColumns);
      }
      
      // Check for existing doctors
      const [doctors] = await connection.execute(
        "SELECT COUNT(*) as count FROM users WHERE role = 'doctor'"
      );
      console.log(`📊 Current doctors in database: ${doctors[0].count}`);
      
    } else {
      console.log('❌ Users table not found');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the initialization
initializeDoctorsDB();
