const mysql = require('mysql2/promise');

async function checkDoctors() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Update if you have a password
      database: 'hospital_management'
    });

    console.log('✅ Database connected successfully');

    // Check if doctors exist
    const [doctors] = await connection.execute(
      'SELECT id, name, email, specialization, department, is_active FROM users WHERE role = "doctor" ORDER BY id'
    );

    console.log('\n📊 Doctors in database:');
    console.log('Total doctors:', doctors.length);
    
    if (doctors.length > 0) {
      doctors.forEach((doctor, index) => {
        console.log(`${index + 1}. ID: ${doctor.id}, Name: ${doctor.name}, Specialization: ${doctor.specialization || 'N/A'}, Active: ${doctor.is_active ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('⚠️  No doctors found in the database');
      
      // Let's add a test doctor
      console.log('\n➕ Adding a test doctor...');
      const [result] = await connection.execute(
        `INSERT INTO users (name, email, password, role, specialization, department, is_active, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        ['Dr. Test Smith', 'testdoctor@hospital.com', '$2a$10$dummy.hash.here', 'doctor', 'General Medicine', 'Internal Medicine', 1]
      );
      
      console.log('✅ Test doctor added with ID:', result.insertId);
    }

    // Check staff_shifts table structure
    console.log('\n📋 Checking staff_shifts table structure:');
    const [columns] = await connection.execute('DESCRIBE staff_shifts');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'}`);
    });

    // Check existing schedules
    console.log('\n📅 Existing schedules:');
    const [schedules] = await connection.execute(
      `SELECT ss.*, u.name as doctor_name 
       FROM staff_shifts ss 
       LEFT JOIN users u ON ss.user_id = u.id 
       ORDER BY ss.shift_date DESC, ss.start_time 
       LIMIT 5`
    );
    
    console.log('Total schedules:', schedules.length);
    schedules.forEach((schedule, index) => {
      console.log(`${index + 1}. ${schedule.doctor_name} on ${schedule.shift_date} (${schedule.start_time} - ${schedule.end_time}) - ${schedule.status}`);
    });

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔐 Database connection closed');
    }
  }
}

checkDoctors();