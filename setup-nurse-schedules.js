const mysql = require('mysql2/promise');

async function createNurseSchedulesTable() {
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

    // Create nurse_schedules table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS nurse_schedules (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nurse_id INT NOT NULL,
        shift_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        ward_assignment VARCHAR(100) NOT NULL DEFAULT 'General Ward',
        shift_type ENUM('Morning', 'Evening', 'Night') NOT NULL DEFAULT 'Morning',
        status ENUM('scheduled', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
        max_patients INT NOT NULL DEFAULT 8,
        current_patients INT NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_nurse_date (nurse_id, shift_date),
        INDEX idx_status (status),
        INDEX idx_ward (ward_assignment),
        INDEX idx_shift_type (shift_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableQuery);
    console.log('✅ nurse_schedules table created successfully');

    // Check if there are any nurses in the system
    const [nurses] = await connection.execute(
      'SELECT id, name FROM users WHERE role = "nurse" AND is_active = 1 LIMIT 5'
    );

    console.log(`\n📊 Found ${nurses.length} nurses in the system`);
    
    if (nurses.length > 0) {
      console.log('👩‍⚕️ Sample nurses:');
      nurses.forEach((nurse, index) => {
        console.log(`  ${index + 1}. ${nurse.name} (ID: ${nurse.id})`);
      });

      // Create sample schedules
      console.log('\n➕ Creating sample nurse schedules...');
      
      const sampleSchedules = [
        {
          nurse_id: nurses[0].id,
          shift_date: '2025-09-18',
          start_time: '06:00:00',
          end_time: '14:00:00',
          ward_assignment: 'General Ward',
          shift_type: 'Morning',
          max_patients: 8
        },
        {
          nurse_id: nurses[0].id,
          shift_date: '2025-09-19',
          start_time: '14:00:00',
          end_time: '22:00:00',
          ward_assignment: 'ICU',
          shift_type: 'Evening',
          max_patients: 6
        }
      ];

      if (nurses.length > 1) {
        sampleSchedules.push({
          nurse_id: nurses[1].id,
          shift_date: '2025-09-18',
          start_time: '22:00:00',
          end_time: '06:00:00',
          ward_assignment: 'Emergency',
          shift_type: 'Night',
          max_patients: 10
        });
      }

      for (const schedule of sampleSchedules) {
        try {
          await connection.execute(
            `INSERT INTO nurse_schedules (
              nurse_id, shift_date, start_time, end_time, 
              ward_assignment, shift_type, max_patients, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
            [
              schedule.nurse_id,
              schedule.shift_date,
              schedule.start_time,
              schedule.end_time,
              schedule.ward_assignment,
              schedule.shift_type,
              schedule.max_patients
            ]
          );
          console.log(`  ✅ Created schedule for nurse ID ${schedule.nurse_id} on ${schedule.shift_date}`);
        } catch (insertError) {
          console.log(`  ⏭️  Schedule for nurse ID ${schedule.nurse_id} on ${schedule.shift_date} may already exist`);
        }
      }
    } else {
      console.log('⚠️  No nurses found. You may need to add nurses first.');
      
      // Create a sample nurse
      console.log('\n➕ Creating a sample nurse...');
      try {
        const [result] = await connection.execute(
          `INSERT INTO users (
            name, email, password, role, mobile, department, 
            specialization, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
          [
            'Nurse Sarah Johnson',
            'sarah.nurse@hospital.com',
            '$2a$10$dummy.hash.here', // In real app, use proper password hashing
            'nurse',
            '+1234567890',
            'General',
            'General Nursing',
          ]
        );
        
        const nurseId = result.insertId;
        console.log(`✅ Sample nurse created with ID: ${nurseId}`);
        
        // Create a sample schedule for the new nurse
        await connection.execute(
          `INSERT INTO nurse_schedules (
            nurse_id, shift_date, start_time, end_time, 
            ward_assignment, shift_type, max_patients, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
          [
            nurseId,
            '2025-09-18',
            '06:00:00',
            '14:00:00',
            'General Ward',
            'Morning',
            8
          ]
        );
        console.log(`✅ Sample schedule created for nurse ID ${nurseId}`);
        
      } catch (insertError) {
        console.log('⚠️  Could not create sample nurse:', insertError.message);
      }
    }

    // Show table structure
    console.log('\n📋 nurse_schedules table structure:');
    const [columns] = await connection.execute('DESCRIBE nurse_schedules');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'}`);
    });

    // Show current schedules
    console.log('\n📅 Current nurse schedules:');
    const [schedules] = await connection.execute(`
      SELECT 
        ns.id,
        u.name as nurse_name,
        ns.shift_date,
        ns.start_time,
        ns.end_time,
        ns.ward_assignment,
        ns.shift_type,
        ns.status,
        ns.max_patients
      FROM nurse_schedules ns
      LEFT JOIN users u ON ns.nurse_id = u.id
      ORDER BY ns.shift_date DESC, ns.start_time
      LIMIT 10
    `);
    
    if (schedules.length > 0) {
      schedules.forEach((schedule, index) => {
        console.log(`  ${index + 1}. ${schedule.nurse_name} - ${schedule.shift_date} (${schedule.start_time}-${schedule.end_time}) - ${schedule.ward_assignment} - ${schedule.status}`);
      });
    } else {
      console.log('  No schedules found');
    }

    console.log('\n🎉 Nurse schedules system setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Go to /admin/nurses-schedules in your application');
    console.log('  2. Create new nurse schedules');
    console.log('  3. Manage existing schedules');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔐 Database connection closed');
    }
  }
}

createNurseSchedulesTable();