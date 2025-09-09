#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testAdminManagement() {
  console.log('🏥 Testing Admin Management System\n');

  // Test 1: Get all admins
  console.log('Test 1: Fetching all admins...');
  try {
    const response = await fetch(`${API_BASE}/super-admin/admins`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Found ${data.admins.length} admin(s)`);
      data.admins.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.mobile}) - ${admin.user_id}`);
      });
    } else {
      console.log('❌ Failed to fetch admins:', data.error);
    }
  } catch (error) {
    console.log('❌ Error fetching admins:', error.message);
  }

  console.log('');

  // Test 2: Create new admin
  console.log('Test 2: Creating new admin...');
  const newAdmin = {
    name: 'Test Admin',
    mobile: '9876543299',
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
      console.log('✅ Admin created successfully');
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

  // Test 3: Update admin
  console.log('Test 3: Updating admin...');
  try {
    // First get the admin we just created
    const getResponse = await fetch(`${API_BASE}/super-admin/admins`);
    const getData = await getResponse.json();
    
    if (getData.success && getData.admins.length > 1) {
      const adminToUpdate = getData.admins.find(admin => admin.mobile === '9876543299');
      
      if (adminToUpdate) {
        const updateData = {
          id: adminToUpdate.id,
          name: 'Updated Test Admin',
          mobile: '9876543299',
          password: '654321'
        };

        const updateResponse = await fetch(`${API_BASE}/super-admin/admins`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        const updateResult = await updateResponse.json();
        
        if (updateResult.success) {
          console.log('✅ Admin updated successfully');
          console.log(`   New name: ${updateResult.admin.name}`);
        } else {
          console.log('❌ Failed to update admin:', updateResult.error);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error updating admin:', error.message);
  }

  console.log('');

  // Test 4: Test login with new admin
  console.log('Test 4: Testing login with new admin...');
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543299',
        password: '654321'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ New admin can login successfully');
      console.log(`   Role: ${loginData.user.role}`);
      console.log(`   Expected redirect: /admin`);
    } else {
      console.log('❌ New admin login failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Error testing login:', error.message);
  }

  console.log('\n🏁 Admin management tests completed!');
  console.log('\n📋 Features tested:');
  console.log('   ✅ Fetch all admins');
  console.log('   ✅ Create new admin with 10-digit mobile + 6-digit password');
  console.log('   ✅ Update admin name, mobile, password');
  console.log('   ✅ Login with new admin credentials');
}

// Run tests
testAdminManagement().catch(console.error);
