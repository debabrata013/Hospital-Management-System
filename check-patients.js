const mysql = require('mysql2/promise');

async function checkPatientUsers() {
  try {
    // Try different common MySQL configurations
    const configs = [
      { host: 'localhost', user: 'root', password: '', database: 'hospital_management' },
      { host: 'localhost', user: 'root', password: 'root', database: 'hospital_management' },
      { host: 'localhost', user: 'root', password: 'password', database: 'hospital_management' }
    ];
    
    let connection = null;
    for (const config of configs) {
      try {
        console.log(`Trying connection with user: ${config.user}, password: ${config.password ? 'set' : 'empty'}`);
        connection = await mysql.createConnection(config);
        console.log('Connected successfully!');
        break;
      } catch (err) {
        console.log(`Failed with config: ${err.message}`);
      }
    }
    
    if (!connection) {
      throw new Error('Could not connect to database with any configuration');
    }
    
    console.log('Checking all roles in users table...');
    const [roles] = await connection.execute('SELECT DISTINCT role, COUNT(*) as count FROM users GROUP BY role');
    console.log('Roles found:', roles);
    
    console.log('\nChecking for patient users...');
    const [patients] = await connection.execute('SELECT id, user_id, name, email, role FROM users WHERE role = ?', ['patient']);
    console.log('Patient users found:', patients.length);
    
    if (patients.length === 0) {
      console.log('\nNo patient users found. Creating sample patient users...');
      await connection.execute(`
        INSERT INTO users (user_id, name, email, password, role, age, gender, contact_number, address, isActive) 
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'PAT001', 'John Doe', 'john.doe@example.com', 'hashed_password', 'patient', 30, 'Male', '9876543210', '123 Main St', 1,
        'PAT002', 'Jane Smith', 'jane.smith@example.com', 'hashed_password', 'patient', 25, 'Female', '9876543211', '456 Oak Ave', 1,
        'PAT003', 'Robert Johnson', 'robert.j@example.com', 'hashed_password', 'patient', 45, 'Male', '9876543212', '789 Pine Rd', 1
      ]);
      console.log('Sample patient users created!');
      
      const [newPatients] = await connection.execute('SELECT id, user_id, name, email, role FROM users WHERE role = ?', ['patient']);
      console.log('New patient count:', newPatients.length);
    } else {
      console.log('Sample patients:');
      patients.slice(0, 5).forEach(p => console.log(`- ${p.name} (${p.user_id})`));
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPatientUsers();
