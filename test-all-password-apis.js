const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testAllPasswordAPIs() {
  console.log('🔍 Testing all password hashing in APIs...\n');

  // Check if all APIs are properly importing bcrypt
  const fs = require('fs');
  const path = require('path');

  const apiFiles = [
    'app/api/super-admin/admins/route.ts',
    'app/api/super-admin/doctors/route.ts', 
    'app/api/super-admin/staff/route.ts',
    'app/api/super-admin/users/route.ts',
    'app/api/staff/create/route.ts'
  ];

  console.log('📁 Checking API files for bcrypt imports:\n');

  for (const file of apiFiles) {
    const filePath = path.join(__dirname, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const hasBcryptImport = content.includes("import bcrypt from 'bcryptjs'");
      const hasPasswordHashing = content.includes('bcrypt.hash(');
      
      console.log(`${file}:`);
      console.log(`  ✅ bcrypt import: ${hasBcryptImport ? 'YES' : 'NO'}`);
      console.log(`  ✅ password hashing: ${hasPasswordHashing ? 'YES' : 'NO'}`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${file}: File not found or error reading`);
    }
  }

  // Check database for any remaining plain text passwords
  console.log('🔍 Checking database for plain text passwords:\n');
  
  const connection = await mysql.createConnection({
    host: 'srv2047.hstgr.io',
    user: 'u153229971_admin',
    password: 'Admin!2025',
    database: 'u153229971_Hospital'
  });

  try {
    const [users] = await connection.execute(
      'SELECT id, name, contact_number, password_hash, role FROM users WHERE LENGTH(password_hash) < 50'
    );

    if (users.length === 0) {
      console.log('✅ All passwords are properly hashed!');
    } else {
      console.log(`❌ Found ${users.length} users with potentially plain text passwords:`);
      for (const user of users) {
        const isHashed = user.password_hash.startsWith('$2');
        console.log(`  - ${user.name} (${user.contact_number}) - ${user.role}: ${isHashed ? 'HASHED' : 'PLAIN TEXT'}`);
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await connection.end();
  }

  console.log('\n🎉 Password security audit completed!');
}

testAllPasswordAPIs();
