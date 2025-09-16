const fetch = require('node-fetch');

async function testScheduleAPI() {
  console.log('Testing Schedule Creation API...');
  
  try {
    const testData = {
      doctorId: 1,
      date: '2025-09-16',
      startTime: '09:00',
      endTime: '17:00',
      roomNumber: 'OPD',
      maxPatients: 10
    };
    
    console.log('Sending test data:', testData);
    
    const response = await fetch('http://localhost:3001/api/admin/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    if (response.ok) {
      console.log('✅ Schedule creation API test PASSED');
    } else {
      console.log('❌ Schedule creation API test FAILED');
      console.log('Error:', responseData.error);
    }
    
  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
}

// Also test the doctors API
async function testDoctorsAPI() {
  console.log('\nTesting Doctors API...');
  
  try {
    const response = await fetch('http://localhost:3001/api/admin/doctors', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    if (response.ok) {
      console.log('✅ Doctors API test PASSED');
      console.log(`Found ${responseData.doctors?.length || 0} doctors`);
    } else {
      console.log('❌ Doctors API test FAILED');
    }
    
  } catch (error) {
    console.error('❌ Doctors API test error:', error.message);
  }
}

async function runTests() {
  await testDoctorsAPI();
  await testScheduleAPI();
}

runTests();