require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function createCleaningManagementSchema() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Creating cleaning management tables...');

    // Create cleaning_staff table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cleaning_staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        status ENUM('Available', 'Busy', 'Off Duty') NOT NULL DEFAULT 'Available',
        current_tasks INT NOT NULL DEFAULT 0,
        max_tasks INT NOT NULL DEFAULT 3,
        specialization JSON NOT NULL,
        shift ENUM('Morning', 'Afternoon', 'Evening', 'Night') NOT NULL DEFAULT 'Morning',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_shift (shift)
      )
    `);
    console.log('✅ cleaning_staff table created');

    // Update room_cleaning table to include missing fields
    await connection.execute(`
      ALTER TABLE room_cleaning 
      ADD COLUMN IF NOT EXISTS priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
      ADD COLUMN IF NOT EXISTS estimated_duration INT NOT NULL DEFAULT 30,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
    console.log('✅ room_cleaning table updated');

    // Check if cleaning_staff table is empty and insert sample data
    const [existingStaff] = await connection.execute('SELECT COUNT(*) as count FROM cleaning_staff');
    
    if (existingStaff[0].count === 0) {
      console.log('Inserting sample cleaning staff data...');
      
      const sampleStaff = [
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          phone: '+1-555-0101',
          status: 'Available',
          current_tasks: 0,
          max_tasks: 3,
          specialization: JSON.stringify(['Deep Clean', 'Sanitization']),
          shift: 'Morning'
        },
        {
          name: 'Mike Chen',
          email: 'mike.chen@hospital.com',
          phone: '+1-555-0102',
          status: 'Available',
          current_tasks: 0,
          max_tasks: 3,
          specialization: JSON.stringify(['Regular Clean', 'Maintenance']),
          shift: 'Afternoon'
        },
        {
          name: 'Lisa Rodriguez',
          email: 'lisa.rodriguez@hospital.com',
          phone: '+1-555-0103',
          status: 'Available',
          current_tasks: 0,
          max_tasks: 3,
          specialization: JSON.stringify(['Deep Clean', 'Emergency Clean']),
          shift: 'Evening'
        },
        {
          name: 'David Wilson',
          email: 'david.wilson@hospital.com',
          phone: '+1-555-0104',
          status: 'Available',
          current_tasks: 0,
          max_tasks: 4,
          specialization: JSON.stringify(['Regular Clean', 'Sanitization', 'Maintenance']),
          shift: 'Night'
        }
      ];

      for (const staff of sampleStaff) {
        await connection.execute(`
          INSERT INTO cleaning_staff (name, email, phone, status, current_tasks, max_tasks, specialization, shift)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          staff.name,
          staff.email,
          staff.phone,
          staff.status,
          staff.current_tasks,
          staff.max_tasks,
          staff.specialization,
          staff.shift
        ]);
      }
      
      console.log('✅ Sample cleaning staff data inserted');
    } else {
      console.log('✅ Cleaning staff table already has data, skipping sample insertion');
    }

    console.log('\n🎉 Cleaning management schema created successfully!');
    console.log('\nTables created/updated:');
    console.log('- cleaning_staff');
    console.log('- room_cleaning (updated)');
    
    console.log('\nSample data:');
    console.log('- 4 sample cleaning staff members with different specializations');

  } catch (error) {
    console.error('❌ Error creating cleaning management schema:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createCleaningManagementSchema()
  .then(() => {
    console.log('\n✅ Cleaning management setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cleaning management setup failed:', error);
    process.exit(1);
  });
