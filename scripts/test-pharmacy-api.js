const axios = require('axios')

const BASE_URL = 'http://localhost:3000/api/pharmacy'

async function testAPI() {
  console.log('🧪 Starting Pharmacy API Tests...\n')

  try {
    // Test 1: Dashboard Stats
    console.log('1. Testing Dashboard Stats...')
    const statsResponse = await axios.get(`${BASE_URL}/dashboard`)
    console.log('✅ Dashboard Stats:', statsResponse.data)
    console.log('')

    // Test 2: Get Medicines
    console.log('2. Testing Get Medicines...')
    const medicinesResponse = await axios.get(`${BASE_URL}/medicines`)
    console.log('✅ Medicines Count:', medicinesResponse.data.data.length)
    console.log('Sample Medicine:', medicinesResponse.data.data[0])
    console.log('')

    // Test 3: Search Medicines
    console.log('3. Testing Medicine Search...')
    const searchResponse = await axios.get(`${BASE_URL}/medicines?search=paracetamol`)
    console.log('✅ Search Results:', searchResponse.data.data.length)
    console.log('')

    // Test 4: Get Vendors
    console.log('4. Testing Get Vendors...')
    const vendorsResponse = await axios.get(`${BASE_URL}/vendors`)
    console.log('✅ Vendors Count:', vendorsResponse.data.data.length)
    console.log('Sample Vendor:', vendorsResponse.data.data[0])
    console.log('')

    // Test 5: Create Vendor
    console.log('5. Testing Create Vendor...')
    const newVendor = {
      name: 'Test Vendor API',
      contact_person: 'Test Contact',
      phone: '9999999999',
      email: 'test@vendor.com',
      address: 'Test Address'
    }
    const createVendorResponse = await axios.post(`${BASE_URL}/vendors`, newVendor)
    console.log('✅ Vendor Created:', createVendorResponse.data.data.name)
    console.log('')

    // Test 6: Get Prescriptions
    console.log('6. Testing Get Prescriptions...')
    const prescriptionsResponse = await axios.get(`${BASE_URL}/prescriptions`)
    console.log('✅ Prescriptions Count:', prescriptionsResponse.data.data.length)
    console.log('')

    // Test 7: Create Prescription
    console.log('7. Testing Create Prescription...')
    const newPrescription = {
      patient_id: 'test-patient-1',
      patient_name: 'Test Patient',
      doctor_id: 'test-doctor-1',
      doctor_name: 'Dr. Test',
      items: [
        {
          medicine_id: medicinesResponse.data.data[0]?.id,
          medicine_name: medicinesResponse.data.data[0]?.name,
          quantity: 10,
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days',
          instructions: 'Take after meals',
          unit_price: medicinesResponse.data.data[0]?.unit_price || 5.00
        }
      ]
    }
    
    if (medicinesResponse.data.data.length > 0) {
      const createPrescriptionResponse = await axios.post(`${BASE_URL}/prescriptions`, newPrescription)
      console.log('✅ Prescription Created:', createPrescriptionResponse.data.data.prescription_number)
      console.log('')
    } else {
      console.log('⚠️ Skipping prescription creation - no medicines available')
      console.log('')
    }

    // Test 8: Get Stock Alerts
    console.log('8. Testing Stock Alerts...')
    const alertsResponse = await axios.get(`${BASE_URL}/alerts`)
    console.log('✅ Stock Alerts Count:', alertsResponse.data.data.length)
    console.log('')

    // Test 9: Create Medicine
    console.log('9. Testing Create Medicine...')
    const newMedicine = {
      name: 'Test Medicine API',
      generic_name: 'Test Generic',
      category: 'Test Category',
      manufacturer: 'Test Manufacturer',
      unit_price: 10.50,
      current_stock: 100,
      minimum_stock: 20,
      maximum_stock: 500,
      unit: 'tablet',
      description: 'Test medicine created via API'
    }
    const createMedicineResponse = await axios.post(`${BASE_URL}/medicines`, newMedicine)
    console.log('✅ Medicine Created:', createMedicineResponse.data.data.name)
    console.log('')

    console.log('🎉 All API tests completed successfully!')

  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message)
    if (error.response?.status === 500) {
      console.log('\n💡 Tip: Make sure your database is running and properly configured')
      console.log('Run: node scripts/init-db.js to initialize the database')
    }
  }
}

// Run tests
testAPI()
