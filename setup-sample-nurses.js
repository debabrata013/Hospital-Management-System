const mysql = require('mysql2/promise');

async function createSampleNurses() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    
    // Create connection
    connection = await mysql.createConnection({
      host: 'srv2047.hstgr.io',
      user: 'u153229971_admin',
      password: 'Admin!2025',
      database: 'u153229971_Hospital',
      port: 3306
    });

    console.log('✅ Connected to MySQL database');

    // Check if nurses already exist
    console.log('🔍 Checking existing nurses...');
    const [existingNurses] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'nurse'"
    );

    console.log(`Found ${existingNurses[0].count} existing nurses`);

    // Create sample nurses if none exist
    const nursesData = [
      {
        name: 'प्रिया शर्मा',
        email: 'priya.sharma@nmsc.com',
        password: '$2a$10$XjvKv9eGh7ZP4sDy4cVqhepQr8QG1Q2C3Qv9JdP4SdLqQwErTyAsK', // password: nurse123
        role: 'nurse',
        contact_number: '9876543210',
        address: 'दिल्ली, भारत'
      },
      {
        name: 'अनिता कुमार',
        email: 'anita.kumar@nmsc.com',
        password: '$2a$10$XjvKv9eGh7ZP4sDy4cVqhepQr8QG1Q2C3Qv9JdP4SdLqQwErTyAsK', // password: nurse123
        role: 'nurse',
        contact_number: '9876543211',
        address: 'गुड़गांव, हरियाणा'
      },
      {
        name: 'सुनीता देवी',
        email: 'sunita.devi@nmsc.com',
        password: '$2a$10$XjvKv9eGh7ZP4sDy4cVqhepQr8QG1Q2C3Qv9JdP4SdLqQwErTyAsK', // password: nurse123
        role: 'nurse',
        contact_number: '9876543212',
        address: 'नोएडा, यूपी'
      },
      {
        name: 'मीनाक्षी गुप्ता',
        email: 'meenakshi.gupta@nmsc.com',
        password: '$2a$10$XjvKv9eGh7ZP4sDy4cVqhepQr8QG1Q2C3Qv9JdP4SdLqQwErTyAsK', // password: nurse123
        role: 'nurse',
        contact_number: '9876543213',
        address: 'फरीदाबाद, हरियाणा'
      },
      {
        name: 'कविता सिंह',
        email: 'kavita.singh@nmsc.com',
        password: '$2a$10$XjvKv9eGh7ZP4sDy4cVqhepQr8QG1Q2C3Qv9JdP4SdLqQwErTyAsK', // password: nurse123
        role: 'nurse',
        contact_number: '9876543214',
        address: 'गाजियाबाद, यूपी'
      }
    ];

    if (existingNurses[0].count === 0) {
      console.log('👩‍⚕️ Creating sample nurses...');
      
      const insertSQL = `
        INSERT INTO users (name, email, password, role, contact_number, address, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      for (const nurse of nursesData) {
        try {
          await connection.execute(insertSQL, [
            nurse.name,
            nurse.email,
            nurse.password,
            nurse.role,
            nurse.contact_number,
            nurse.address
          ]);
          console.log(`   ✓ Created nurse: ${nurse.name}`);
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            console.log(`   ⚠️  Nurse ${nurse.name} already exists, skipping`);
          } else {
            console.log(`   ❌ Error creating nurse ${nurse.name}: ${err.message}`);
          }
        }
      }
    } else {
      console.log('✅ Nurses already exist, skipping creation');
    }

    // Verify the nurses
    console.log('🔍 Verifying nurses...');
    const [nurses] = await connection.execute(`
      SELECT id, name, email, role, contact_number, created_at
      FROM users 
      WHERE role = 'nurse'
      ORDER BY name ASC
    `);

    console.log(`✅ Setup complete! Found ${nurses.length} nurses:`);
    nurses.forEach((nurse, index) => {
      console.log(`   ${index + 1}. ${nurse.name} (${nurse.email}) - Contact: ${nurse.contact_number}`);
    });

    console.log('\n🎉 Nurses setup completed successfully!');
    console.log('Login credentials for all nurses:');
    console.log('Password: nurse123');
    console.log('\nYou can now see these nurses in the dropdown when creating schedules.');

  } catch (error) {
    console.error('❌ Error setting up nurses:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
createSampleNurses().catch(console.error);