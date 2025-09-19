const mysql = require('mysql2/promise');

async function checkShivamUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔍 Checking shivam user details...\n');

    // Find shivam in users table
    const [users] = await connection.execute(`
      SELECT id, user_id, name, email, contact_number, role, department, created_at
      FROM users 
      WHERE name LIKE '%shivam%' OR user_id LIKE '%shivam%'
      ORDER BY id DESC
    `);

    console.log('👤 Users matching "shivam":');
    if (users.length === 0) {
      console.log('  No users found matching "shivam"');
    } else {
      users.forEach(user => {
        console.log(`  ID: ${user.id} | User ID: ${user.user_id} | Name: ${user.name} | Email: ${user.email} | Phone: ${user.contact_number} | Role: ${user.role} | Dept: ${user.department}`);
      });
    }

    // Check all nurses
    console.log('\n👩‍⚕️ All nurses in system:');
    const [nurses] = await connection.execute(`
      SELECT id, user_id, name, email, contact_number, department, created_at
      FROM users 
      WHERE role = 'nurse'
      ORDER BY id DESC
      LIMIT 10
    `);

    nurses.forEach(nurse => {
      console.log(`  ID: ${nurse.id} | User ID: ${nurse.user_id} | Name: ${nurse.name} | Phone: ${nurse.contact_number} | Dept: ${nurse.department}`);
    });

    // Check if there are any schedules for the found users
    if (users.length > 0) {
      console.log('\n📅 Checking schedules for found users:');
      for (const user of users) {
        const [schedules] = await connection.execute(`
          SELECT id, shift_date, start_time, end_time, shift_type, department, status
          FROM nurse_schedules 
          WHERE nurse_id = ?
          ORDER BY shift_date DESC
        `, [user.id]);

        console.log(`  User ${user.name} (ID: ${user.id}): ${schedules.length} schedules`);
        schedules.forEach(schedule => {
          console.log(`    - ${schedule.shift_date} ${schedule.start_time}-${schedule.end_time} ${schedule.shift_type} (${schedule.status})`);
        });
      }
    }

    await connection.end();
    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkShivamUser();
