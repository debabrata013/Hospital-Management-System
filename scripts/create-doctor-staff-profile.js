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

async function createDoctorStaffProfile() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check if staff profile already exists for the doctor
    const [existingProfile] = await connection.execute(`
      SELECT s.id, s.user_id, u.name, u.role
      FROM staff_profiles s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE u.role = 'doctor'
    `);

    if (existingProfile.length > 0) {
      console.log('✅ Doctor staff profile already exists:');
      existingProfile.forEach((profile, index) => {
        console.log(`  Profile ${index + 1}: ID ${profile.id}, User: ${profile.name} (${profile.role})`);
      });
      return;
    }

    // Get the doctor user
    const [doctorUser] = await connection.execute(`
      SELECT id, name, role
      FROM users
      WHERE role = 'doctor' AND is_active = 1
      LIMIT 1
    `);

    if (doctorUser.length === 0) {
      console.log('❌ No doctor user found');
      return;
    }

    const doctor = doctorUser[0];
    console.log(`📝 Creating staff profile for: ${doctor.name} (${doctor.role})`);

    // Create staff profile
    const [result] = await connection.execute(`
      INSERT INTO staff_profiles (
        user_id, employee_type, work_location, created_at
      ) VALUES (?, 'full-time', 'Main Hospital', NOW())
    `, [doctor.id]);

    console.log(`✅ Created staff profile with ID: ${result.insertId}`);
    console.log('🎉 Doctor staff profile created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating doctor staff profile:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createDoctorStaffProfile();
