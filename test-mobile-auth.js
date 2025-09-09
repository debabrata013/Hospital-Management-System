#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testMobileAuth() {
  console.log('🧪 Testing Mobile Number Authentication System\n');

  // Test 1: Valid mobile number login
  console.log('Test 1: Valid mobile number login');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543210',  // Super admin mobile
        password: '123456'    // Super admin password
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Mobile login successful');
      console.log(`   User: ${result.user.name}`);
      console.log(`   Role: ${result.user.role}`);
      console.log(`   Mobile: ${result.user.mobile}`);
      console.log(`   Expected redirect: /super-admin\n`);
    } else {
      console.log('❌ Mobile login failed:', result.message);
    }
  } catch (error) {
    console.log('❌ Mobile login error:', error.message);
  }

  // Test 2: Invalid mobile number format
  console.log('Test 2: Invalid mobile number format');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '123456789',   // Invalid 9-digit number
        password: '123456'
      })
    });

    const result = await response.json();
    console.log(response.ok ? '❌ Should have failed' : '✅ Correctly rejected invalid mobile');
    console.log(`   Message: ${result.message}\n`);
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }

  // Test 3: Wrong password
  console.log('Test 3: Wrong password');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543210',
        password: 'wrongpass'
      })
    });

    const result = await response.json();
    console.log(response.ok ? '❌ Should have failed' : '✅ Correctly rejected wrong password');
    console.log(`   Message: ${result.message}\n`);
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }

  // Test 4: Email login (should still work)
  console.log('Test 4: Email login (backward compatibility)');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: 'superadmin@hospital.com',
        password: '123456'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email login still works');
      console.log(`   User: ${result.user.name}`);
      console.log(`   Role: ${result.user.role}\n`);
    } else {
      console.log('❌ Email login failed:', result.message);
    }
  } catch (error) {
    console.log('❌ Email login error:', error.message);
  }

  console.log('🏁 Authentication tests completed!');
}

// Run tests
testMobileAuth().catch(console.error);
