const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🏥 Initializing Hospital Management System Database...\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'admin-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL by semicolon and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          process.stdout.write('.');
        } catch (error) {
          if (error.code !== 'ER_DUP_TABLE' && error.code !== 'ER_DUP_KEYNAME') {
            console.error(`\n❌ Error executing statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n✅ Database schema created successfully');
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Created tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    // Insert additional sample data
    console.log('\n📝 Inserting sample data...');
    
    // Insert sample appointments
    await connection.execute(`
      INSERT IGNORE INTO appointments (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, service_type, reason, status) VALUES
      ('APT001', 1, 1, CURDATE(), '09:00:00', 'Consultation', 'Regular checkup', 'confirmed'),
      ('APT002', 2, 2, CURDATE(), '10:00:00', 'Follow-up', 'Post-treatment review', 'scheduled')
    `);
    
    // Insert sample admissions
    await connection.execute(`
      INSERT IGNORE INTO admissions (admission_id, patient_id, doctor_id, room_id, admission_date, condition_notes, status) VALUES
      ('ADM001', 1, 1, 1, NOW(), 'Heart surgery recovery', 'admitted')
    `);
    
    // Update room status for admitted patient
    await connection.execute(`
      UPDATE rooms SET status = 'occupied' WHERE id = 1
    `);
    
    // Insert sample billing
    await connection.execute(`
      INSERT IGNORE INTO billing (bill_id, patient_id, appointment_id, bill_date, subtotal, tax_amount, total_amount, status) VALUES
      ('BILL001', 1, 1, CURDATE(), 500.00, 50.00, 550.00, 'paid'),
      ('BILL002', 2, 2, CURDATE(), 300.00, 30.00, 330.00, 'pending')
    `);
    
    // Insert sample doctor schedules
    await connection.execute(`
      INSERT IGNORE INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
      (1, 'Monday', '09:00:00', '17:00:00', 1),
      (1, 'Tuesday', '09:00:00', '17:00:00', 1),
      (1, 'Wednesday', '09:00:00', '17:00:00', 1),
      (2, 'Monday', '08:00:00', '16:00:00', 1),
      (2, 'Tuesday', '08:00:00', '16:00:00', 1),
      (2, 'Wednesday', '08:00:00', '16:00:00', 1)
    `);
    
    console.log('✅ Sample data inserted successfully');
    
    // Test queries to verify functionality
    console.log('\n🧪 Testing database functionality...');
    
    const [statsResult] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM patients WHERE is_active = 1) as total_patients,
        (SELECT COUNT(*) FROM doctors WHERE is_active = 1) as total_doctors,
        (SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date) = CURDATE()) as today_appointments,
        (SELECT COUNT(*) FROM medicines WHERE current_stock <= minimum_stock) as low_stock_items
    `);
    
    const stats = statsResult[0];
    console.log(`   📊 Total Patients: ${stats.total_patients}`);
    console.log(`   👨‍⚕️ Total Doctors: ${stats.total_doctors}`);
    console.log(`   📅 Today's Appointments: ${stats.today_appointments}`);
    console.log(`   ⚠️ Low Stock Items: ${stats.low_stock_items}`);
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n🚀 Your Hospital Management System is ready to use!');
    console.log('   - Admin Dashboard: http://localhost:3001/admin');
    console.log('   - API Endpoints: /api/admin/*');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeDatabase().catch(console.error);
