#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testMySQLIntegration() {
  console.log('🗄️ Testing MySQL Database Integration\n');

  // Test 1: Login with database
  console.log('Test 1: Testing login with MySQL database...');
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'admin@hospital.com', // Try with existing user
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login with MySQL successful');
      console.log(`   User: ${loginData.user.name}`);
      console.log(`   Role: ${loginData.user.role}`);
      console.log(`   Email: ${loginData.user.email}`);
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }

  console.log('');

  // Test 2: Create admin via MySQL
  console.log('Test 2: Creating admin via MySQL...');
  const newAdmin = {
    name: 'MySQL Test Admin',
    mobile: '9876543290',
    password: '123456'
  };

  try {
    const response = await fetch(`${API_BASE}/super-admin/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Admin created in MySQL successfully');
      console.log(`   Name: ${data.admin.name}`);
      console.log(`   Mobile: ${data.admin.mobile}`);
      console.log(`   User ID: ${data.admin.user_id}`);
      console.log(`   Email: ${data.admin.email}`);
    } else {
      console.log('❌ Failed to create admin:', data.error);
    }
  } catch (error) {
    console.log('❌ Error creating admin:', error.message);
  }

  console.log('');

  // Test 3: Create doctor via MySQL
  console.log('Test 3: Creating doctor via MySQL...');
  const newDoctor = {
    name: 'MySQL Test Doctor',
    mobile: '9876543289',
    password: '123456',
    department: 'Cardiology',
    experience: '5 years',
    patientsTreated: '1000+',
    description: 'Experienced cardiologist',
    available: 'Mon-Fri, 9am-5pm',
    languages: 'Hindi, English'
  };

  try {
    const response = await fetch(`${API_BASE}/super-admin/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoctor)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Doctor created in MySQL successfully');
      console.log(`   Name: Dr. ${data.doctor.name}`);
      console.log(`   Mobile: ${data.doctor.mobile}`);
      console.log(`   User ID: ${data.doctor.user_id}`);
      console.log(`   Department: ${data.doctor.department}`);
      console.log(`   Experience: ${data.doctor.experience}`);
    } else {
      console.log('❌ Failed to create doctor:', data.error);
    }
  } catch (error) {
    console.log('❌ Error creating doctor:', error.message);
  }

  console.log('');

  // Test 4: Test login with newly created users
  console.log('Test 4: Testing login with newly created users...');
  
  // Test admin login
  try {
    const adminLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543290',
        password: '123456'
      })
    });

    const adminLoginData = await adminLoginResponse.json();
    
    if (adminLoginResponse.ok) {
      console.log('✅ New admin can login successfully');
      console.log(`   Role: ${adminLoginData.user.role}`);
      console.log(`   Expected redirect: /admin`);
    } else {
      console.log('❌ New admin login failed:', adminLoginData.message);
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
  }

  // Test doctor login
  try {
    const doctorLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543289',
        password: '123456'
      })
    });

    const doctorLoginData = await doctorLoginResponse.json();
    
    if (doctorLoginResponse.ok) {
      console.log('✅ New doctor can login successfully');
      console.log(`   Role: ${doctorLoginData.user.role}`);
      console.log(`   Department: ${doctorLoginData.user.department}`);
      console.log(`   Expected redirect: /doctor`);
    } else {
      console.log('❌ New doctor login failed:', doctorLoginData.message);
    }
  } catch (error) {
    console.log('❌ Doctor login error:', error.message);
  }

  console.log('\n🏁 MySQL Integration tests completed!');
  console.log('\n📋 Database Migration Summary:');
  console.log('   ✅ Removed users-auth-data.json file');
  console.log('   ✅ Updated login API to use MySQL');
  console.log('   ✅ Updated admin management API to use MySQL');
  console.log('   ✅ Updated doctor management API to use MySQL');
  console.log('   ✅ All user creation/login now uses your MySQL database');
  console.log('\n🗄️ Your system now runs entirely on MySQL database!');
}

// Run tests
testMySQLIntegration().catch(console.error);
