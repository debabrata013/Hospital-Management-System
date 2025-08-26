// Script to create pharmacy user
// Hospital Management System - Arogya Hospital

const { executeQuery } = require('../lib/mysql-connection.js');
const bcrypt = require('bcryptjs');

async function createPharmacyUser() {
  try {
    console.log('Creating pharmacy user...');

    const email = 'p@gmail.com';
    const password = 'p@gmail.com';
    const name = 'Pharmacy User';
    const role = 'pharmacy';

    // 1. Check if user already exists
    console.log('Checking if user already exists...');
    const existingUser = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      console.log('User already exists. Updating role to pharmacy...');
      
      // Update existing user to pharmacy role
      const hashedPassword = await bcrypt.hash(password, 10);
      await executeQuery(
        'UPDATE users SET role = ?, password_hash = ?, name = ?, department = ?, updated_at = NOW() WHERE email = ?',
        [role, hashedPassword, name, 'Pharmacy', email]
      );
      
      console.log('✅ User updated successfully!');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Role:', role);
      return;
    }

    // 2. Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Generate unique user_id
    const generateUserId = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      return `PH${timestamp}${random}`.toUpperCase();
    };

    const userId = generateUserId();

    // 4. Insert new user
    console.log('Creating new pharmacy user...');
    const insertQuery = `
      INSERT INTO users (user_id, name, email, password_hash, role, contact_number, department, is_active, is_verified, joining_date, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), NOW(), NOW())
    `;
    
    const result = await executeQuery(insertQuery, [
      userId,
      name,
      email,
      hashedPassword,
      role,
      '9999999999', // Default contact number
      'Pharmacy',
      1, // is_active
      1  // is_verified
    ]);

    console.log('✅ Pharmacy user created successfully!');
    console.log('User ID:', userId);
    console.log('Database ID:', result.insertId);
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', role);

    // 5. Verify the user was created
    const verifyUser = await executeQuery('SELECT id, user_id, name, email, role, department, is_active FROM users WHERE email = ?', [email]);
    console.log('\n📋 User verification:');
    console.log(verifyUser[0]);

  } catch (error) {
    console.error('❌ Error creating pharmacy user:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createPharmacyUser();
