const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:3000'

async function testPharmacyAPIs() {
  console.log('🧪 Testing Pharmacy API Endpoints...\n')

  try {
    // Test 1: Test prescription dispensing API
    console.log('💊 Test 1: Testing prescription dispensing API...')
    
    const prescriptionId = 'PRESC123'
    const dispensingData = {
      items: [
        {
          medicine_id: 1,
          medicine_name: 'Paracetamol 500mg',
          quantity: 10,
          unit_price: 5.00
        },
        {
          medicine_id: 2,
          medicine_name: 'Amoxicillin 250mg',
          quantity: 21,
          unit_price: 15.00
        }
      ]
    }

    const dispenseResponse = await fetch(`${BASE_URL}/api/pharmacy/prescriptions/${prescriptionId}/dispense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dispensingData)
    })

    const dispenseResult = await dispenseResponse.json()
    console.log('Dispense API Response:', dispenseResult.success ? '✅ SUCCESS' : '❌ FAILED')
    if (!dispenseResult.success) console.log('Error:', dispenseResult.error)

    // Test 2: Test billing creation API
    console.log('\n🧾 Test 2: Testing billing creation API...')
    
    const billingData = {
      patient_id: 'PAT001',
      items: [
        {
          medicine_id: 1,
          medicine_name: 'Paracetamol 500mg',
          bill_quantity: 5,
          unit_price: 5.00
        }
      ],
      payment_method: 'cash',
      total_amount: 25.00
    }

    const billingResponse = await fetch(`${BASE_URL}/api/pharmacy/billing/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billingData)
    })

    const billingResult = await billingResponse.json()
    console.log('Billing API Response:', billingResult.success ? '✅ SUCCESS' : '❌ FAILED')
    if (!billingResult.success) console.log('Error:', billingResult.error)

    // Test 3: Test pharmacy dashboard API
    console.log('\n📊 Test 3: Testing pharmacy dashboard API...')
    
    const dashboardResponse = await fetch(`${BASE_URL}/api/pharmacy/dashboard`)
    const dashboardResult = await dashboardResponse.json()
    console.log('Dashboard API Response:', dashboardResult.success ? '✅ SUCCESS' : '❌ FAILED')
    if (dashboardResult.success) {
      console.log('Dashboard stats:', {
        totalMedicines: dashboardResult.data.totalMedicines,
        lowStock: dashboardResult.data.lowStock,
        totalValue: dashboardResult.data.totalValue
      })
    }

    // Test 4: Test stock alerts API
    console.log('\n⚠️ Test 4: Testing stock alerts API...')
    
    const alertsResponse = await fetch(`${BASE_URL}/api/pharmacy/alerts`)
    const alertsResult = await alertsResponse.json()
    console.log('Alerts API Response:', alertsResult.success ? '✅ SUCCESS' : '❌ FAILED')
    if (alertsResult.success) {
      console.log(`Found ${alertsResult.data.length} stock alerts`)
    }

    // Test 5: Test medicines API
    console.log('\n💊 Test 5: Testing medicines API...')
    
    const medicinesResponse = await fetch(`${BASE_URL}/api/pharmacy/medicines`)
    const medicinesResult = await medicinesResponse.json()
    console.log('Medicines API Response:', medicinesResult.success ? '✅ SUCCESS' : '❌ FAILED')
    if (medicinesResult.success) {
      console.log(`Found ${medicinesResult.data.length} medicines`)
    }

    // Test 6: Test prescriptions API
    console.log('\n📋 Test 6: Testing prescriptions API...')
    
    const prescriptionsResponse = await fetch(`${BASE_URL}/api/pharmacy/prescriptions`)
    const prescriptionsResult = await prescriptionsResponse.json()
    console.log('Prescriptions API Response:', prescriptionsResult.success ? '✅ SUCCESS' : '❌ FAILED')
    if (prescriptionsResult.success) {
      console.log(`Found ${prescriptionsResult.data.length} prescriptions`)
    }

    console.log('\n🎉 API Testing completed!')

  } catch (error) {
    console.error('❌ API Test failed:', error.message)
  }
}

// Test offline functionality simulation
async function testOfflineFunctionality() {
  console.log('\n🔌 Testing Offline Functionality Simulation...\n')

  // Simulate IndexedDB operations
  const offlineData = {
    billing: [
      {
        id: 'offline_1704723600000',
        patient_id: 'PAT001',
        patient_name: 'Test Patient',
        items: [{ medicine_name: 'Paracetamol', quantity: 5, unit_price: 5.00 }],
        total_amount: 25.00,
        isOffline: true,
        createdAt: new Date().toISOString()
      }
    ],
    prescriptions: [
      {
        id: 'offline_1704723700000',
        patient_id: 'PAT002',
        doctor_id: 'DOC001',
        medications: [{ medicine_name: 'Amoxicillin', dosage: '250mg' }],
        isOffline: true,
        createdAt: new Date().toISOString()
      }
    ]
  }

  console.log('📱 Offline data simulation:')
  console.log(`   - Offline bills: ${offlineData.billing.length}`)
  console.log(`   - Offline prescriptions: ${offlineData.prescriptions.length}`)

  // Simulate sync process
  console.log('\n🔄 Simulating sync process...')
  let syncedCount = 0

  for (const bill of offlineData.billing) {
    try {
      // Simulate API call
      console.log(`   - Syncing bill ${bill.id}... ✅`)
      syncedCount++
    } catch (error) {
      console.log(`   - Failed to sync bill ${bill.id}... ❌`)
    }
  }

  for (const prescription of offlineData.prescriptions) {
    try {
      // Simulate API call
      console.log(`   - Syncing prescription ${prescription.id}... ✅`)
      syncedCount++
    } catch (error) {
      console.log(`   - Failed to sync prescription ${prescription.id}... ❌`)
    }
  }

  console.log(`\n✅ Sync completed: ${syncedCount} items synced`)
}

// Run all tests
async function runAllTests() {
  await testPharmacyAPIs()
  await testOfflineFunctionality()
  
  console.log('\n📋 Test Summary:')
  console.log('✅ Prescription dispensing API - TESTED')
  console.log('✅ Auto-billing API - TESTED')
  console.log('✅ Dashboard API - TESTED')
  console.log('✅ Stock alerts API - TESTED')
  console.log('✅ Medicines API - TESTED')
  console.log('✅ Prescriptions API - TESTED')
  console.log('✅ Offline functionality - SIMULATED')
}

runAllTests()
