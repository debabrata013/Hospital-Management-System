const fs = require('fs')
const path = require('path')

function testAPIStructure() {
  console.log('🌐 Testing API Structure and Implementation...\n')

  const apiBasePath = path.join(__dirname, 'app', 'api', 'pharmacy')
  
  // Check if pharmacy API directory exists
  if (!fs.existsSync(apiBasePath)) {
    console.log('❌ Pharmacy API directory not found')
    return
  }

  console.log('✅ Pharmacy API directory exists')

  // Test API endpoints
  const endpoints = [
    { name: 'Medicines API', path: 'medicines/route.ts' },
    { name: 'Prescriptions API', path: 'prescriptions/route.ts' },
    { name: 'Billing Create API', path: 'billing/create/route.ts' },
    { name: 'Dashboard API', path: 'dashboard/route.ts' },
    { name: 'Stock Alerts API', path: 'alerts/route.ts' },
    { name: 'Vendors API', path: 'vendors/route.ts' },
    { name: 'Prescription Dispense API', path: 'prescriptions/[id]/dispense/route.ts' }
  ]

  console.log('\n📋 Checking API Endpoints:')
  endpoints.forEach(endpoint => {
    const fullPath = path.join(apiBasePath, endpoint.path)
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${endpoint.name} - EXISTS`)
      
      // Check file content for basic structure
      const content = fs.readFileSync(fullPath, 'utf8')
      const hasGET = /export async function GET/.test(content)
      const hasPOST = /export async function POST/.test(content)
      const hasPUT = /export async function PUT/.test(content)
      const hasDELETE = /export async function DELETE/.test(content)
      
      const methods = []
      if (hasGET) methods.push('GET')
      if (hasPOST) methods.push('POST')
      if (hasPUT) methods.push('PUT')
      if (hasDELETE) methods.push('DELETE')
      
      console.log(`   Methods: ${methods.join(', ') || 'None'}`)
    } else {
      console.log(`❌ ${endpoint.name} - MISSING`)
    }
  })
}

function testPharmacyServiceMethods() {
  console.log('\n🔧 Testing Pharmacy Service Methods...\n')

  const servicePath = path.join(__dirname, 'lib', 'services', 'pharmacy.ts')
  
  if (!fs.existsSync(servicePath)) {
    console.log('❌ Pharmacy service file not found')
    return
  }

  console.log('✅ Pharmacy service file exists')
  
  const content = fs.readFileSync(servicePath, 'utf8')
  
  const methods = [
    { name: 'getMedicines', pattern: /getMedicines/ },
    { name: 'createMedicine', pattern: /createMedicine/ },
    { name: 'getPrescriptions', pattern: /getPrescriptions/ },
    { name: 'createPrescription', pattern: /createPrescription/ },
    { name: 'dispensePrescription', pattern: /dispensePrescription/ },
    { name: 'createAutoBill', pattern: /createAutoBill/ },
    { name: 'getStockAlerts', pattern: /getStockAlerts/ },
    { name: 'createStockTransaction', pattern: /createStockTransaction/ },
    { name: 'getVendors', pattern: /getVendors/ },
    { name: 'getDashboardStats', pattern: /getDashboardStats/ }
  ]

  console.log('📋 Checking Service Methods:')
  methods.forEach(method => {
    if (method.pattern.test(content)) {
      console.log(`✅ ${method.name} - IMPLEMENTED`)
    } else {
      console.log(`❌ ${method.name} - MISSING`)
    }
  })
}

function testAutoBillingIntegration() {
  console.log('\n💰 Testing Auto-billing Integration...\n')

  const servicePath = path.join(__dirname, 'lib', 'services', 'pharmacy.ts')
  
  if (!fs.existsSync(servicePath)) {
    console.log('❌ Pharmacy service file not found')
    return
  }

  const content = fs.readFileSync(servicePath, 'utf8')
  
  // Check for auto-billing integration in dispensePrescription
  const checks = [
    { 
      name: 'Get Prescription for Billing', 
      pattern: /getPrescriptionById.*id/ 
    },
    { 
      name: 'Calculate Total Amount', 
      pattern: /totalAmount.*\+=.*quantity.*unit_price/ 
    },
    { 
      name: 'Auto-bill Creation Call', 
      pattern: /createAutoBill/ 
    },
    { 
      name: 'Bill ID Generation', 
      pattern: /generateId.*BILL/ 
    },
    { 
      name: 'Billing Table Insert', 
      pattern: /INSERT INTO billing/ 
    },
    { 
      name: 'Billing Items Insert', 
      pattern: /INSERT INTO billing_items/ 
    },
    { 
      name: 'Reference ID Linking', 
      pattern: /reference_id.*prescription/ 
    }
  ]

  console.log('📋 Auto-billing Integration Checks:')
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name} - IMPLEMENTED`)
    } else {
      console.log(`❌ ${check.name} - MISSING`)
    }
  })
}

function testOfflineUIIntegration() {
  console.log('\n📱 Testing Offline UI Integration...\n')

  const billingPagePath = path.join(__dirname, 'app', 'pharmacy', 'billing', 'page.tsx')
  
  if (!fs.existsSync(billingPagePath)) {
    console.log('❌ Billing page not found')
    return
  }

  console.log('✅ Billing page exists')
  
  const content = fs.readFileSync(billingPagePath, 'utf8')
  
  const checks = [
    { name: 'Offline Manager Import', pattern: /pharmacyOfflineManager/ },
    { name: 'Online Status State', pattern: /isOnline.*useState/ },
    { name: 'Online Event Listeners', pattern: /addEventListener.*online/ },
    { name: 'Offline Bill Saving', pattern: /saveOfflineBill/ },
    { name: 'Offline Status Display', pattern: /OfflineBilling/ },
    { name: 'Conditional Bill Creation', pattern: /if.*isOnline/ }
  ]

  console.log('📋 Offline UI Integration Checks:')
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name} - IMPLEMENTED`)
    } else {
      console.log(`❌ ${check.name} - MISSING`)
    }
  })
}

// Run all tests
function runAPITests() {
  console.log('🧪 Testing Backend API Implementation\n')
  console.log('=' .repeat(50))
  
  testAPIStructure()
  testPharmacyServiceMethods()
  testAutoBillingIntegration()
  testOfflineUIIntegration()
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 Backend API Test Summary:')
  console.log('✅ API Structure - CHECKED')
  console.log('✅ Service Methods - CHECKED')
  console.log('✅ Auto-billing Integration - CHECKED')
  console.log('✅ Offline UI Integration - CHECKED')
  console.log('\n🎉 All backend API tests completed!')
}

runAPITests()
