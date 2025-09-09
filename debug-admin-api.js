#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function debugAdminAPI() {
  console.log('🔍 Debugging Admin Creation API\n');

  // Test with valid data
  console.log('Test 1: Valid admin data...');
  const validAdmin = {
    name: 'Debug Test Admin',
    mobile: '9876543283',
    password: '123456'
  };

  try {
    const response = await fetch(`${API_BASE}/super-admin/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validAdmin)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.log('❌ Request failed with status:', response.status);
      console.log('Error details:', data);
    } else {
      console.log('✅ Request successful');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test with invalid mobile
  console.log('Test 2: Invalid mobile number...');
  const invalidMobile = {
    name: 'Test Admin',
    mobile: '123456789', // 9 digits
    password: '123456'
  };

  try {
    const response = await fetch(`${API_BASE}/super-admin/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidMobile)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test with invalid password
  console.log('Test 3: Invalid password...');
  const invalidPassword = {
    name: 'Test Admin',
    mobile: '9876543282',
    password: '12345' // 5 digits
  };

  try {
    const response = await fetch(`${API_BASE}/super-admin/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPassword)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test with missing fields
  console.log('Test 4: Missing fields...');
  const missingFields = {
    name: 'Test Admin'
    // missing mobile and password
  };

  try {
    const response = await fetch(`${API_BASE}/super-admin/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(missingFields)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugAdminAPI().catch(console.error);
