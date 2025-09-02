require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function setupRoomManagementComplete() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');
    
    console.log('\n🏗️ Creating room management tables...');

    // 1. Create rooms table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(10) UNIQUE NOT NULL,
        room_name VARCHAR(100),
        room_type ENUM('General', 'Semi-Private', 'Private', 'ICU', 'Emergency') NOT NULL,
        floor INT NOT NULL,
        capacity INT NOT NULL DEFAULT 1,
        current_occupancy INT NOT NULL DEFAULT 0,
        status ENUM('Available', 'Occupied', 'Under Maintenance', 'Cleaning Required') NOT NULL DEFAULT 'Available',
        daily_rate DECIMAL(10,2) DEFAULT 0.00,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_type (room_type),
        INDEX idx_floor (floor)
      )
    `);
    console.log('✅ rooms table created');

    // 2. Create patients table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id VARCHAR(20) UNIQUE,
        name VARCHAR(100) NOT NULL,
        contact_number VARCHAR(20),
        gender ENUM('Male', 'Female', 'Other', 'Unknown') DEFAULT 'Unknown',
        date_of_birth DATE,
        address TEXT,
        emergency_contact VARCHAR(100),
        medical_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_contact (contact_number)
      )
    `);
    console.log('✅ patients table created');

    // 3. Create room_assignments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        patient_id INT NOT NULL,
        admission_date DATE NOT NULL,
        expected_discharge_date DATE NOT NULL,
        actual_discharge_date DATE,
        diagnosis TEXT NOT NULL,
        notes TEXT,
        status ENUM('Active', 'Discharged', 'Transferred') NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_room_id (room_id),
        INDEX idx_patient_id (patient_id),
        INDEX idx_status (status),
        INDEX idx_admission_date (admission_date)
      )
    `);
    console.log('✅ room_assignments table created');

    // 4. Create room_cleaning table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_cleaning (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        cleaning_type ENUM('Regular', 'Deep Clean', 'Discharge Clean', 'Sanitization', 'Maintenance') NOT NULL,
        assigned_to VARCHAR(100),
        scheduled_date DATETIME NOT NULL,
        completed_date DATETIME,
        status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Verified') NOT NULL DEFAULT 'Scheduled',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
        estimated_duration INT NOT NULL DEFAULT 30,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        INDEX idx_room_id (room_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_scheduled_date (scheduled_date)
      )
    `);
    console.log('✅ room_cleaning table created');

    // 5. Create cleaning_staff table
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

    // 6. Create room_maintenance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_maintenance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        maintenance_type ENUM('Repair', 'Upgrade', 'Inspection', 'Emergency') NOT NULL,
        description TEXT NOT NULL,
        assigned_to VARCHAR(100),
        scheduled_date DATETIME NOT NULL,
        completed_date DATETIME,
        estimated_cost DECIMAL(10,2),
        actual_cost DECIMAL(10,2),
        status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
        priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        INDEX idx_room_id (room_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority)
      )
    `);
    console.log('✅ room_maintenance table created');

    console.log('\n📊 Inserting sample data...');

    // Check if rooms table is empty and insert sample data
    const [existingRooms] = await connection.execute('SELECT COUNT(*) as count FROM rooms');
    
    if (existingRooms[0].count === 0) {
      console.log('🏠 Inserting sample room data...');
      
      const sampleRooms = [
        {
          room_number: '101',
          room_name: 'General Ward 1',
          room_type: 'General',
          floor: 1,
          capacity: 4,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 500.00,
          description: 'General ward with 4 beds'
        },
        {
          room_number: '102',
          room_name: 'General Ward 2',
          room_type: 'General',
          floor: 1,
          capacity: 4,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 500.00,
          description: 'General ward with 4 beds'
        },
        {
          room_number: '201',
          room_name: 'Semi-Private Room 1',
          room_type: 'Semi-Private',
          floor: 2,
          capacity: 2,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 1000.00,
          description: 'Semi-private room with 2 beds'
        },
        {
          room_number: '202',
          room_name: 'Semi-Private Room 2',
          room_type: 'Semi-Private',
          floor: 2,
          capacity: 2,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 1000.00,
          description: 'Semi-private room with 2 beds'
        },
        {
          room_number: '301',
          room_name: 'Private Room 1',
          room_type: 'Private',
          floor: 3,
          capacity: 1,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 2000.00,
          description: 'Private room with single bed'
        },
        {
          room_number: '302',
          room_name: 'Private Room 2',
          room_type: 'Private',
          floor: 3,
          capacity: 1,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 2000.00,
          description: 'Private room with single bed'
        },
        {
          room_number: '401',
          room_name: 'ICU Room 1',
          room_type: 'ICU',
          floor: 4,
          capacity: 1,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 5000.00,
          description: 'Intensive Care Unit room'
        },
        {
          room_number: '402',
          room_name: 'ICU Room 2',
          room_type: 'ICU',
          floor: 4,
          capacity: 1,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 5000.00,
          description: 'Intensive Care Unit room'
        },
        {
          room_number: 'ER1',
          room_name: 'Emergency Room 1',
          room_type: 'Emergency',
          floor: 1,
          capacity: 1,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 3000.00,
          description: 'Emergency room'
        },
        {
          room_number: 'ER2',
          room_name: 'Emergency Room 2',
          room_type: 'Emergency',
          floor: 1,
          capacity: 1,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 3000.00,
          description: 'Emergency room'
        }
      ];

      for (const room of sampleRooms) {
        await connection.execute(`
          INSERT INTO rooms (room_number, room_name, room_type, floor, capacity, current_occupancy, status, daily_rate, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          room.room_number,
          room.room_name,
          room.room_type,
          room.floor,
          room.capacity,
          room.current_occupancy,
          room.status,
          room.daily_rate,
          room.description
        ]);
      }
      
      console.log('✅ Sample room data inserted');
    } else {
      console.log('✅ Rooms table already has data, skipping sample insertion');
    }

    // Check if cleaning_staff table is empty and insert sample data
    const [existingStaff] = await connection.execute('SELECT COUNT(*) as count FROM cleaning_staff');
    
    if (existingStaff[0].count === 0) {
      console.log('👥 Inserting sample cleaning staff data...');
      
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

    // Check if patients table is empty and insert sample data
    const [existingPatients] = await connection.execute('SELECT COUNT(*) as count FROM patients');
    
    if (existingPatients[0].count === 0) {
      console.log('👤 Inserting sample patient data...');
      
      const samplePatients = [
        {
          patient_id: 'P001',
          name: 'John Doe',
          contact_number: '+1-555-0001',
          gender: 'Male',
          date_of_birth: '1980-05-15',
          address: '123 Main St, City, State',
          emergency_contact: 'Jane Doe +1-555-0002',
          medical_history: 'Hypertension, Diabetes'
        },
        {
          patient_id: 'P002',
          name: 'Jane Smith',
          contact_number: '+1-555-0003',
          gender: 'Female',
          date_of_birth: '1985-08-22',
          address: '456 Oak Ave, City, State',
          emergency_contact: 'John Smith +1-555-0004',
          medical_history: 'Asthma'
        },
        {
          patient_id: 'P003',
          name: 'Robert Johnson',
          contact_number: '+1-555-0005',
          gender: 'Male',
          date_of_birth: '1975-12-10',
          address: '789 Pine Rd, City, State',
          emergency_contact: 'Mary Johnson +1-555-0006',
          medical_history: 'Heart condition'
        }
      ];

      for (const patient of samplePatients) {
        await connection.execute(`
          INSERT INTO patients (patient_id, name, contact_number, gender, date_of_birth, address, emergency_contact, medical_history)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          patient.patient_id,
          patient.name,
          patient.contact_number,
          patient.gender,
          patient.date_of_birth,
          patient.address,
          patient.emergency_contact,
          patient.medical_history
        ]);
      }
      
      console.log('✅ Sample patient data inserted');
    } else {
      console.log('✅ Patients table already has data, skipping sample insertion');
    }

    console.log('\n🎉 Room management system setup completed successfully!');
    console.log('\n📋 Tables created/updated:');
    console.log('- rooms');
    console.log('- patients');
    console.log('- room_assignments');
    console.log('- room_cleaning');
    console.log('- cleaning_staff');
    console.log('- room_maintenance');
    
    console.log('\n📊 Sample data inserted:');
    console.log('- 10 sample rooms with different types and capacities');
    console.log('- 4 sample cleaning staff members with different specializations');
    console.log('- 3 sample patients');
    
    console.log('\n🚀 Your room management system is now ready!');
    console.log('All data will be persisted in the database and won\'t disappear on refresh.');

  } catch (error) {
    console.error('❌ Error setting up room management system:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
setupRoomManagementComplete()
  .then(() => {
    console.log('\n✅ Room management setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Room management setup failed:', error);
    process.exit(1);
  });
