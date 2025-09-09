const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixAllPasswords() {
  const connection = await mysql.createConnection({
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital'
  });

  try {
    // Get all users with potentially plain text passwords
    const [users] = await connection.execute(
      'SELECT id, name, contact_number, password_hash, role FROM users WHERE LENGTH(password_hash) < 50'
    );

    console.log(`Found ${users.length} users with potentially plain text passwords`);

    for (const user of users) {
      try {
        // Try to verify if it's already hashed (bcrypt hashes start with $2)
        if (user.password_hash.startsWith('$2')) {
          console.log(`✅ ${user.name} (${user.contact_number}) - Already hashed`);
          continue;
        }

        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(user.password_hash, 10);
        
        await connection.execute(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [hashedPassword, user.id]
        );

        console.log(`✅ Fixed ${user.name} (${user.contact_number}) - ${user.role}`);
      } catch (error) {
        console.log(`❌ Error fixing ${user.name}: ${error.message}`);
      }
    }

    console.log('\n🎉 Password fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixAllPasswords();
