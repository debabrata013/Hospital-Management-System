require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function createRoomManagementSchema() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Creating room management tables...');

    // Create rooms table
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ rooms table created');

    // Create room_assignments table
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
        INDEX idx_status (status)
      )
    `);
    console.log('✅ room_assignments table created');

    // Create room_cleaning table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_cleaning (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        cleaning_type ENUM('Regular', 'Deep Clean', 'Discharge Clean') NOT NULL,
        assigned_to VARCHAR(100),
        scheduled_date DATETIME NOT NULL,
        completed_date DATETIME,
        status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        INDEX idx_room_id (room_id),
        INDEX idx_status (status),
        INDEX idx_scheduled_date (scheduled_date)
      )
    `);
    console.log('✅ room_cleaning table created');

    // Create room_maintenance table
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

    // Check if rooms table is empty and insert sample data
    const [existingRooms] = await connection.execute('SELECT COUNT(*) as count FROM rooms');
    
    if (existingRooms[0].count === 0) {
      console.log('Inserting sample room data...');
      
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

    console.log('\n🎉 Room management schema created successfully!');
    console.log('\nTables created:');
    console.log('- rooms');
    console.log('- room_assignments');
    console.log('- room_cleaning');
    console.log('- room_maintenance');
    
    console.log('\nSample data:');
    console.log('- 10 sample rooms with different types and capacities');

  } catch (error) {
    console.error('❌ Error creating room management schema:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createRoomManagementSchema()
  .then(() => {
    console.log('\n✅ Room management setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Room management setup failed:', error);
    process.exit(1);
  });
