const mysql = require('mysql2/promise');

async function showAllUsers() {
  let connection;
  
  try {
    // Database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hospital_db'
    });

    console.log('✅ Connected to database');

    // Query all users
    const [users] = await connection.execute(`
      SELECT 
        id,
        email,
        role,
        employeeId,
        isActive,
        firstName,
        lastName,
        phoneNumber,
        gender,
        dateOfBirth,
        createdAt,
        updatedAt
      FROM Users 
      ORDER BY createdAt DESC
    `);

    console.log('\n📋 ALL USERS IN DATABASE:');
    console.log('=' .repeat(80));
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. USER ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Employee ID: ${user.employeeId || 'N/A'}`);
      console.log(`   Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
      console.log(`   Phone: ${user.phoneNumber || 'N/A'}`);
      console.log(`   Gender: ${user.gender || 'N/A'}`);
      console.log(`   DOB: ${user.dateOfBirth || 'N/A'}`);
      console.log(`   Active: ${user.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
    });

    // Summary by role
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 SUMMARY BY ROLE:');
    console.log('=' .repeat(40));
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`${role}: ${count} users`);
    });

    console.log(`\n🔢 TOTAL USERS: ${users.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

showAllUsers();
