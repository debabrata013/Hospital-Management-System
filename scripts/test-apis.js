#!/usr/bin/env node

// API Endpoints Test Script
// Hospital Management System - MySQL Migration

const BASE_URL = 'http://localhost:3000';
let authToken = null;

// Test authentication
async function testAuth() {
  console.log('🔐 Testing Authentication...\n');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@arogyahospital.com',
        password: 'Admin@123'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      authToken = data.token;
      console.log('✅ Authentication successful');
      console.log(`   User: ${data.user.name}`);
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Token: ${authToken.substring(0, 20)}...\n`);
      return true;
    } else {
      console.error('❌ Authentication failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return false;
  }
}

// Test API endpoint
async function testEndpoint(method, endpoint, data = null, description = '') {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (response.ok && result.success) {
      console.log(`✅ ${description || `${method} ${endpoint}`}`);
      return result;
    } else {
      console.error(`❌ ${description || `${method} ${endpoint}`}: ${result.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ ${description || `${method} ${endpoint}`}: ${error.message}`);
    return null;
  }
}

// Test all endpoints
async function testAllEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  // Test patients
  console.log('👥 Testing Patient Management:');
  await testEndpoint('GET', '/api/patients', null, 'Get patients list');
  
  const patientData = {
    name: 'Test Patient',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    contactNumber: '+91-9876543210',
    address: '123 Test Street, Test City',
    emergencyContactName: 'Emergency Contact',
    emergencyContactNumber: '+91-9876543211'
  };
  
  const createdPatient = await testEndpoint('POST', '/api/patients', patientData, 'Create new patient');
  console.log('');

  // Test appointments
  console.log('📅 Testing Appointment Management:');
  await testEndpoint('GET', '/api/appointments', null, 'Get appointments list');
  console.log('');

  // Test prescriptions
  console.log('💊 Testing Prescription Management:');
  await testEndpoint('GET', '/api/prescriptions', null, 'Get prescriptions list');
  console.log('');

  // Test billing
  console.log('💰 Testing Billing Management:');
  await testEndpoint('GET', '/api/billing', null, 'Get bills list');
  console.log('');

  // Test medicines
  console.log('🏥 Testing Medicine Management:');
  await testEndpoint('GET', '/api/medicines', null, 'Get medicines list');
  console.log('');

  // Test staff
  console.log('👨‍⚕️ Testing Staff Management:');
  await testEndpoint('GET', '/api/staff', null, 'Get staff list');
  console.log('');

  // Test reports
  console.log('📊 Testing Reports:');
  await testEndpoint('GET', '/api/reports?type=dashboard', null, 'Get dashboard report');
  console.log('');
}

// Test server health
async function testServerHealth() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting API Tests...\n');

  // Check if server is running
  const serverRunning = await testServerHealth();
  if (!serverRunning) {
    console.error('❌ Server is not running. Please start your Next.js application first:');
    console.error('   npm run dev\n');
    console.log('💡 In another terminal, run:');
    console.log('   cd "/Users/debabratapattnayak/LYFEINDEX_projects/Hospital Management System"');
    console.log('   npm run dev\n');
    console.log('   Then run this test again: npm run test:apis\n');
    process.exit(1);
  }

  console.log('✅ Server is running\n');

  // Test authentication first
  const authSuccess = await testAuth();
  if (!authSuccess) {
    console.error('❌ Cannot proceed without authentication. Please check your admin user setup.\n');
    console.log('💡 To create admin user, run:');
    console.log('   npm run db:create-admin\n');
    process.exit(1);
  }

  // Test all endpoints
  await testAllEndpoints();

  console.log('🎉 API testing complete!\n');
  console.log('📋 Next Steps:');
  console.log('1. Check any failed endpoints and fix issues');
  console.log('2. Test frontend integration');
  console.log('3. Create additional test data if needed');
  console.log('4. Deploy to production\n');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Testing interrupted by user');
  process.exit(0);
});

// Run the tests
main().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
