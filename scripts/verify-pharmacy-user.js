// Verify pharmacy user credentials
// Hospital Management System - Arogya Hospital

const { executeQuery } = require('../lib/mysql-connection.js');
const bcrypt = require('bcryptjs');

async function verifyPharmacyUser() {
  try {
    console.log('Verifying pharmacy user credentials...');

    const email = 'p@gmail.com';
    const password = 'p@gmail.com';

    // 1. Get user from database
    const users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log('- ID:', user.id);
    console.log('- User ID:', user.user_id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Department:', user.department);
    console.log('- Active:', user.is_active ? 'Yes' : 'No');
    console.log('- Verified:', user.is_verified ? 'Yes' : 'No');

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
    }

    console.log('\n🔐 Login credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', user.role);

  } catch (error) {
    console.error('❌ Error verifying user:', error);
  } finally {
    process.exit(0);
  }
}

// Run the verification
verifyPharmacyUser();
