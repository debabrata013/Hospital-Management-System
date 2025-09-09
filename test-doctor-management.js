#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testDoctorManagement() {
  console.log('👨‍⚕️ Testing Doctor Management System\n');

  // Test 1: Get all doctors
  console.log('Test 1: Fetching all doctors...');
  try {
    const response = await fetch(`${API_BASE}/super-admin/doctors`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Found ${data.doctors.length} doctor(s)`);
      data.doctors.forEach(doctor => {
        console.log(`   - Dr. ${doctor.name} (${doctor.mobile}) - ${doctor.user_id} - ${doctor.department}`);
      });
    } else {
      console.log('❌ Failed to fetch doctors:', data.error);
    }
  } catch (error) {
    console.log('❌ Error fetching doctors:', error.message);
  }

  console.log('');

  // Test 2: Create new doctor
  console.log('Test 2: Creating new doctor...');
  const newDoctor = {
    name: 'Test Doctor',
    mobile: '9876543298',
    password: '123456',
    department: 'Cardiology'
  };

  try {
    const response = await fetch(`${API_BASE}/super-admin/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoctor)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Doctor created successfully');
      console.log(`   Name: Dr. ${data.doctor.name}`);
      console.log(`   Mobile: ${data.doctor.mobile}`);
      console.log(`   User ID: ${data.doctor.user_id}`);
      console.log(`   Email: ${data.doctor.email}`);
      console.log(`   Department: ${data.doctor.department}`);
    } else {
      console.log('❌ Failed to create doctor:', data.error);
    }
  } catch (error) {
    console.log('❌ Error creating doctor:', error.message);
  }

  console.log('');

  // Test 3: Update doctor
  console.log('Test 3: Updating doctor...');
  try {
    // First get the doctor we just created
    const getResponse = await fetch(`${API_BASE}/super-admin/doctors`);
    const getData = await getResponse.json();
    
    if (getData.success && getData.doctors.length > 1) {
      const doctorToUpdate = getData.doctors.find(doctor => doctor.mobile === '9876543298');
      
      if (doctorToUpdate) {
        const updateData = {
          id: doctorToUpdate.id,
          name: 'Updated Test Doctor',
          mobile: '9876543298',
          password: '654321',
          department: 'Neurology'
        };

        const updateResponse = await fetch(`${API_BASE}/super-admin/doctors`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        const updateResult = await updateResponse.json();
        
        if (updateResult.success) {
          console.log('✅ Doctor updated successfully');
          console.log(`   New name: Dr. ${updateResult.doctor.name}`);
          console.log(`   New department: ${updateResult.doctor.department}`);
        } else {
          console.log('❌ Failed to update doctor:', updateResult.error);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error updating doctor:', error.message);
  }

  console.log('');

  // Test 4: Test login with new doctor
  console.log('Test 4: Testing login with new doctor...');
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543298',
        password: '654321'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ New doctor can login successfully');
      console.log(`   Role: ${loginData.user.role}`);
      console.log(`   Department: ${loginData.user.department}`);
      console.log(`   Expected redirect: /doctor`);
    } else {
      console.log('❌ New doctor login failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Error testing login:', error.message);
  }

  console.log('\n🏁 Doctor management tests completed!');
  console.log('\n📋 Features tested:');
  console.log('   ✅ Fetch all doctors');
  console.log('   ✅ Create new doctor with 10-digit mobile + 6-digit password');
  console.log('   ✅ Update doctor name, mobile, password, department');
  console.log('   ✅ Login with new doctor credentials');
  console.log('   ✅ Department/specialization selection');
}

// Run tests
testDoctorManagement().catch(console.error);
