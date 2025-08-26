// Test all pharmacy APIs
// Hospital Management System - Arogya Hospital

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/pharmacy';

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();

    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.success) {
      console.log('✅ API working correctly');
      if (data.data) {
        console.log(`Data keys: ${Object.keys(data.data).join(', ')}`);
      }
    } else {
      console.log('❌ API error:', data.error);
    }

    return { success: data.success, status: response.status, data: data.data };
  } catch (error) {
    console.log(`\n${method} ${endpoint}`);
    console.log('❌ Request failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Pharmacy APIs...\n');

  // Test 1: Stock API
  await testAPI('/stock');
  await testAPI('/stock?alertType=low');
  await testAPI('/stock?alertType=expiring');
  await testAPI('/stock?alertType=expired');

  // Test 2: Medicines API
  await testAPI('/medicines?page=1&limit=10');
  await testAPI('/medicines?lowStock=true');
  await testAPI('/medicines?expiringSoon=true');

  // Test 3: Prescriptions API
  await testAPI('/prescriptions?limit=5');
  await testAPI('/prescriptions?status=active&pendingOnly=true');
  
  // Test 4: Get specific prescription (using first available)
  const prescriptionsResult = await testAPI('/prescriptions?limit=1');
  if (prescriptionsResult.success && prescriptionsResult.data.prescriptions.length > 0) {
    const prescriptionId = prescriptionsResult.data.prescriptions[0].id;
    await testAPI(`/prescriptions/${prescriptionId}`);
  }

  // Test 5: Reports API
  await testAPI('/reports?type=overview');
  await testAPI('/reports?type=prescriptions');
  await testAPI('/reports?type=dispensing');
  await testAPI('/reports?type=inventory');
  await testAPI('/reports?type=financial');
  await testAPI('/reports?type=alerts');

  // Test 6: Search API
  await testAPI('/search?q=paracetamol');

  console.log('\n🎉 All API tests completed!');
}

// Run the tests
runTests().catch(console.error);
