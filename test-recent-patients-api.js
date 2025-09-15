// Use built-in fetch (Node.js 18+) or fallback
const fetch = globalThis.fetch || require('node-fetch');

async function testRecentPatientsAPI() {
  console.log('🔍 TESTING RECENT PATIENTS API\n');

  try {
    // Test with doctor login first
    console.log('1. Logging in as doctor...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543212',
        password: '111111'
      })
    });
    
    const loginResult = await loginResponse.json();
    const cookies = loginResponse.headers.get('set-cookie');
    
    if (loginResponse.ok && cookies) {
      console.log(`   ✅ Login successful: Status ${loginResponse.status}`);
      console.log(`   📋 User info:`, loginResult.user);
      
      // Test recent patients API
      console.log('\n2. Testing recent patients API...');
      const patientsResponse = await fetch('http://localhost:3000/api/doctor/recent-patients', {
        headers: { 'Cookie': cookies }
      });
      
      console.log(`   📊 API Response Status: ${patientsResponse.status}`);
      
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        console.log(`   📋 Patients Data:`, JSON.stringify(patientsData, null, 2));
        console.log(`   📈 Total patients found: ${patientsData.length}`);
      } else {
        const errorData = await patientsResponse.text();
        console.log(`   ❌ API Error:`, errorData);
      }
      
    } else {
      console.log(`   ❌ Login failed: Status ${loginResponse.status}`);
      console.log(`   📋 Response:`, loginResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRecentPatientsAPI();
