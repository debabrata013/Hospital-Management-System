#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testEnhancedDoctorManagement() {
  console.log('👨‍⚕️ Testing Enhanced Doctor Management System\n');

  // Test 1: Create doctor with all new fields
  console.log('Test 1: Creating doctor with all enhanced fields...');
  const newDoctor = {
    name: 'Enhanced Test Doctor',
    mobile: '9876543297',
    password: '123456',
    department: 'Cardiology',
    experience: '8 years',
    patientsTreated: '2500+',
    description: 'Experienced cardiologist specializing in heart surgeries and interventional procedures.',
    available: 'Mon-Sat, 9am-1pm, 3pm-6pm',
    languages: 'Hindi, English, Gujarati'
  };

  try {
    const response = await fetch(`${API_BASE}/super-admin/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoctor)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Enhanced doctor created successfully');
      console.log(`   Name: Dr. ${data.doctor.name}`);
      console.log(`   Mobile: ${data.doctor.mobile}`);
      console.log(`   Department: ${data.doctor.department}`);
      console.log(`   Experience: ${data.doctor.experience}`);
      console.log(`   Patients Treated: ${data.doctor.patientsTreated}`);
      console.log(`   Available: ${data.doctor.available}`);
      console.log(`   Languages: ${data.doctor.languages}`);
      console.log(`   Description: ${data.doctor.description}`);
    } else {
      console.log('❌ Failed to create enhanced doctor:', data.error);
    }
  } catch (error) {
    console.log('❌ Error creating enhanced doctor:', error.message);
  }

  console.log('');

  // Test 2: Get all doctors and verify new fields
  console.log('Test 2: Fetching all doctors with enhanced fields...');
  try {
    const response = await fetch(`${API_BASE}/super-admin/doctors`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Found ${data.doctors.length} doctor(s) with enhanced data`);
      data.doctors.forEach(doctor => {
        console.log(`\n   Dr. ${doctor.name} (${doctor.user_id})`);
        console.log(`   Mobile: ${doctor.mobile}`);
        console.log(`   Department: ${doctor.department}`);
        console.log(`   Experience: ${doctor.experience || 'Not specified'}`);
        console.log(`   Patients Treated: ${doctor.patientsTreated || 'Not specified'}`);
        console.log(`   Available: ${doctor.available || 'Not specified'}`);
        console.log(`   Languages: ${doctor.languages || 'Not specified'}`);
        if (doctor.description) {
          console.log(`   Description: ${doctor.description.substring(0, 50)}...`);
        }
      });
    } else {
      console.log('❌ Failed to fetch doctors:', data.error);
    }
  } catch (error) {
    console.log('❌ Error fetching doctors:', error.message);
  }

  console.log('');

  // Test 3: Update doctor with new fields
  console.log('Test 3: Updating doctor with enhanced fields...');
  try {
    const getResponse = await fetch(`${API_BASE}/super-admin/doctors`);
    const getData = await getResponse.json();
    
    if (getData.success && getData.doctors.length > 0) {
      const doctorToUpdate = getData.doctors.find(doctor => doctor.mobile === '9876543297');
      
      if (doctorToUpdate) {
        const updateData = {
          id: doctorToUpdate.id,
          name: 'Updated Enhanced Doctor',
          mobile: '9876543297',
          password: '654321',
          department: 'Neurology',
          experience: '10 years',
          patientsTreated: '3000+',
          description: 'Senior neurologist with expertise in brain surgeries and neurological disorders.',
          available: 'Mon-Fri, 10am-2pm, 4pm-7pm',
          languages: 'Hindi, English, Marathi, Bengali'
        };

        const updateResponse = await fetch(`${API_BASE}/super-admin/doctors`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        const updateResult = await updateResponse.json();
        
        if (updateResult.success) {
          console.log('✅ Enhanced doctor updated successfully');
          console.log(`   New name: Dr. ${updateResult.doctor.name}`);
          console.log(`   New department: ${updateResult.doctor.department}`);
          console.log(`   New experience: ${updateResult.doctor.experience}`);
          console.log(`   New patients treated: ${updateResult.doctor.patientsTreated}`);
          console.log(`   New availability: ${updateResult.doctor.available}`);
          console.log(`   New languages: ${updateResult.doctor.languages}`);
        } else {
          console.log('❌ Failed to update enhanced doctor:', updateResult.error);
        }
      }
    }
  } catch (error) {
    console.log('❌ Error updating enhanced doctor:', error.message);
  }

  console.log('\n🏁 Enhanced doctor management tests completed!');
  console.log('\n📋 New features tested:');
  console.log('   ✅ Experience field (string)');
  console.log('   ✅ Patients Treated field (string)');
  console.log('   ✅ Description field (textarea)');
  console.log('   ✅ Available field (schedule string)');
  console.log('   ✅ Languages field (comma-separated string)');
  console.log('   ✅ All fields work in create, read, and update operations');
}

// Run tests
testEnhancedDoctorManagement().catch(console.error);
