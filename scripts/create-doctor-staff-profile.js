require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function createDoctorStaffProfile() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Creating doctor staff profiles...');

    // Get all users with role 'doctor' who don't have staff profiles
    const [doctorsWithoutProfiles] = await connection.execute(`
      SELECT u.id, u.name, u.email
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'doctor' AND sp.user_id IS NULL
    `);

    if (doctorsWithoutProfiles.length === 0) {
      console.log('✅ All doctors already have staff profiles');
      return;
    }

    console.log(`Found ${doctorsWithoutProfiles.length} doctors without staff profiles`);

    // Sample departments and specializations
    const departments = [
      'General Medicine',
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Emergency Medicine',
      'Surgery',
      'Radiology',
      'Dermatology',
      'Psychiatry'
    ];

    const specializations = [
      'Internal Medicine',
      'Cardiovascular Disease',
      'Neurological Disorders',
      'Orthopedic Surgery',
      'Pediatric Care',
      'Emergency Care',
      'General Surgery',
      'Diagnostic Imaging',
      'Skin Disorders',
      'Mental Health'
    ];

    // Create staff profiles for each doctor
    for (const doctor of doctorsWithoutProfiles) {
      const department = departments[Math.floor(Math.random() * departments.length)];
      const specialization = specializations[Math.floor(Math.random() * specializations.length)];
      
      await connection.execute(`
        INSERT INTO staff_profiles (user_id, department, specialization, contact_number, address, hire_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        doctor.id,
        department,
        specialization,
        `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`, // Random phone number
        `${Math.floor(Math.random() * 9999) + 1} Hospital Street, City, State`,
        new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)) // Random hire date within last year
      ]);

      console.log(`✅ Created staff profile for Dr. ${doctor.name} (${department} - ${specialization})`);
    }

    console.log(`\n🎉 Successfully created ${doctorsWithoutProfiles.length} staff profiles`);

    // Show summary
    const [totalDoctors] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM users u
      JOIN staff_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'doctor'
    `);

    console.log(`\n📊 Total doctors with profiles: ${totalDoctors[0].count}`);

  } catch (error) {
    console.error('❌ Error creating doctor staff profiles:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createDoctorStaffProfile()
  .then(() => {
    console.log('\n✅ Doctor staff profiles created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Doctor staff profiles creation failed:', error);
    process.exit(1);
  });
