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

async function createRoomManagementSchema() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Create rooms table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(20) UNIQUE NOT NULL,
        room_name VARCHAR(100),
        room_type ENUM('General', 'Semi-Private', 'Private', 'ICU', 'Emergency') DEFAULT 'General',
        floor INT NOT NULL DEFAULT 1,
        capacity INT NOT NULL DEFAULT 1,
        current_occupancy INT NOT NULL DEFAULT 0,
        status ENUM('Available', 'Occupied', 'Under Maintenance', 'Cleaning Required') DEFAULT 'Available',
        daily_rate DECIMAL(10,2) DEFAULT 0.00,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_room_number (room_number),
        INDEX idx_status (status),
        INDEX idx_room_type (room_type)
      )
    `);
    console.log('✅ Rooms table created/verified');

    // Create room_assignments table for patient-room assignments
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        patient_id INT NOT NULL,
        admission_date DATE NOT NULL,
        expected_discharge_date DATE,
        actual_discharge_date DATE,
        diagnosis TEXT,
        notes TEXT,
        status ENUM('Active', 'Discharged', 'Transferred') DEFAULT 'Active',
        assigned_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        INDEX idx_room_id (room_id),
        INDEX idx_patient_id (patient_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ Room assignments table created/verified');

    // Create room_cleaning table for cleaning management
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_cleaning (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        cleaning_type ENUM('Regular', 'Deep Clean', 'Discharge Clean', 'Maintenance') DEFAULT 'Regular',
        assigned_to VARCHAR(100),
        scheduled_date DATE NOT NULL,
        completed_date DATETIME,
        status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        INDEX idx_room_id (room_id),
        INDEX idx_status (status),
        INDEX idx_scheduled_date (scheduled_date)
      )
    `);
    console.log('✅ Room cleaning table created/verified');

    // Create room_maintenance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_maintenance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        maintenance_type ENUM('Repair', 'Upgrade', 'Inspection', 'Emergency') DEFAULT 'Repair',
        description TEXT NOT NULL,
        assigned_to VARCHAR(100),
        scheduled_date DATE NOT NULL,
        completed_date DATETIME,
        estimated_cost DECIMAL(10,2),
        actual_cost DECIMAL(10,2),
        status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        INDEX idx_room_id (room_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority)
      )
    `);
    console.log('✅ Room maintenance table created/verified');

    // Check if we have sample data
    const [existingRooms] = await connection.execute('SELECT COUNT(*) as count FROM rooms');
    
    if (existingRooms[0].count === 0) {
      console.log('📝 Creating sample rooms...');
      
      const sampleRooms = [
        {
          room_number: '101',
          room_name: 'General Ward A',
          room_type: 'General',
          floor: 1,
          capacity: 2,
          current_occupancy: 1,
          status: 'Occupied',
          daily_rate: 1500.00
        },
        {
          room_number: '102',
          room_name: 'Private Room A',
          room_type: 'Private',
          floor: 1,
          capacity: 1,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 3500.00
        },
        {
          room_number: '201',
          room_name: 'ICU Room 1',
          room_type: 'ICU',
          floor: 2,
          capacity: 1,
          current_occupancy: 1,
          status: 'Occupied',
          daily_rate: 8000.00
        },
        {
          room_number: '202',
          room_name: 'Semi-Private Room A',
          room_type: 'Semi-Private',
          floor: 2,
          capacity: 2,
          current_occupancy: 0,
          status: 'Cleaning Required',
          daily_rate: 2500.00
        },
        {
          room_number: '301',
          room_name: 'Emergency Room 1',
          room_type: 'Emergency',
          floor: 3,
          capacity: 1,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 5000.00
        },
        {
          room_number: '103',
          room_name: 'General Ward B',
          room_type: 'General',
          floor: 1,
          capacity: 2,
          current_occupancy: 0,
          status: 'Available',
          daily_rate: 1500.00
        }
      ];

      for (const room of sampleRooms) {
        await connection.execute(`
          INSERT INTO rooms (
            room_number, room_name, room_type, floor, capacity, 
            current_occupancy, status, daily_rate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          room.room_number, room.room_name, room.room_type, room.floor,
          room.capacity, room.current_occupancy, room.status, room.daily_rate
        ]);
      }
      
      console.log('✅ Sample rooms created');
    } else {
      console.log(`📊 Found ${existingRooms[0].count} existing rooms`);
    }

    console.log('🎉 Room management schema setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up room management schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createRoomManagementSchema();
