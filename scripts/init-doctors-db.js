const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function initializeDoctorsDB() {
  let connection;
  
  try {
    console.log('🏥 Initializing Doctors Database...');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if users table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      // Create users table
      await connection.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('super_admin', 'admin', 'doctor', 'nurse', 'staff', 'patient') NOT NULL DEFAULT 'patient',
          contact_number VARCHAR(20),
          specialization VARCHAR(100),
          qualification VARCHAR(255),
          experience_years INT DEFAULT 0,
          license_number VARCHAR(100) UNIQUE,
          department VARCHAR(100),
          address TEXT,
          date_of_birth DATE,
          gender ENUM('Male', 'Female', 'Other'),
          joining_date DATE,
          salary DECIMAL(10,2),
          is_active BOOLEAN DEFAULT TRUE,
          is_verified BOOLEAN DEFAULT FALSE,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_role (role),
          INDEX idx_email (email),
          INDEX idx_user_id (user_id),
          INDEX idx_specialization (specialization),
          INDEX idx_department (department),
          INDEX idx_is_active (is_active)
        )
      `);
      console.log('✅ Users table created');
    } else {
      console.log('✅ Users table already exists');
      
      // Check and add missing columns
      const [columns] = await connection.execute("DESCRIBE users");
      const columnNames = columns.map(col => col.Field);
      
      const columnsToAdd = [
        { name: 'specialization', definition: 'VARCHAR(100)' },
        { name: 'qualification', definition: 'VARCHAR(255)' },
        { name: 'experience_years', definition: 'INT DEFAULT 0' },
        { name: 'license_number', definition: 'VARCHAR(100) UNIQUE' },
        { name: 'department', definition: 'VARCHAR(100)' },
        { name: 'address', definition: 'TEXT' },
        { name: 'date_of_birth', definition: 'DATE' },
        { name: 'gender', definition: "ENUM('Male', 'Female', 'Other')" },
        { name: 'joining_date', definition: 'DATE' },
        { name: 'salary', definition: 'DECIMAL(10,2)' },
        { name: 'is_verified', definition: 'BOOLEAN DEFAULT FALSE' },
        { name: 'last_login', definition: 'TIMESTAMP NULL' }
      ];
      
      for (const column of columnsToAdd) {
        if (!columnNames.includes(column.name)) {
          try {
            await connection.execute(`ALTER TABLE users ADD COLUMN ${column.name} ${column.definition}`);
            console.log(`✅ Added column: ${column.name}`);
          } catch (error) {
            console.log(`⚠️  Column ${column.name} might already exist or error: ${error.message}`);
          }
        }
      }
    }
    
    // Check for existing doctors
    const [doctors] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'doctor'"
    );
    
    if (doctors[0].count === 0) {
      // Insert sample doctors
      const sampleDoctors = [
        {
          user_id: 'DOC001',
          name: 'Dr. Anjali Mehta',
          email: 'anjali.mehta@hospital.com',
          password_hash: '$2a$10$example.hash.for.password123',
          role: 'doctor',
          contact_number: '+91 98765 43210',
          specialization: 'Cardiologist',
          qualification: 'MBBS, MD Cardiology',
          experience_years: 12,
          license_number: 'MED123456',
          department: 'Cardiology',
          is_active: true,
          is_verified: true
        },
        {
          user_id: 'DOC002',
          name: 'Dr. Vikram Singh',
          email: 'vikram.singh@hospital.com',
          password_hash: '$2a$10$example.hash.for.password123',
          role: 'doctor',
          contact_number: '+91 87654 32109',
          specialization: 'Neurologist',
          qualification: 'MBBS, MD Neurology',
          experience_years: 15,
          license_number: 'MED123457',
          department: 'Neurology',
          is_active: true,
          is_verified: true
        },
        {
          user_id: 'DOC003',
          name: 'Dr. Sunita Rao',
          email: 'sunita.rao@hospital.com',
          password_hash: '$2a$10$example.hash.for.password123',
          role: 'doctor',
          contact_number: '+91 76543 21098',
          specialization: 'Pediatrician',
          qualification: 'MBBS, MD Pediatrics',
          experience_years: 8,
          license_number: 'MED123458',
          department: 'Pediatrics',
          is_active: false,
          is_verified: true
        }
      ];
      
      for (const doctor of sampleDoctors) {
        try {
          await connection.execute(`
            INSERT INTO users (
              user_id, name, email, password_hash, role, contact_number,
              specialization, qualification, experience_years, license_number,
              department, is_active, is_verified, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            doctor.user_id, doctor.name, doctor.email, doctor.password_hash,
            doctor.role, doctor.contact_number, doctor.specialization,
            doctor.qualification, doctor.experience_years, doctor.license_number,
            doctor.department, doctor.is_active, doctor.is_verified
          ]);
          console.log(`✅ Added sample doctor: ${doctor.name}`);
        } catch (error) {
          console.log(`⚠️  Could not add ${doctor.name}: ${error.message}`);
        }
      }
    } else {
      console.log(`📊 Found ${doctors[0].count} existing doctors in database`);
    }
    
    // Final verification
    const [finalCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'doctor'"
    );
    console.log(`📊 Total doctors in database: ${finalCount[0].count}`);
    
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
