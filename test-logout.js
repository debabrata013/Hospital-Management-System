#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testLogout() {
  console.log('🔐 Testing Logout Functionality\n');

  // Step 1: Login first
  console.log('Step 1: Logging in as Super Admin...');
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543210',
        password: '123456'
      })
    });

    if (loginResponse.ok) {
      console.log('✅ Login successful');
      
      // Get cookies from login response
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('   Cookies received:', cookies ? 'Yes' : 'No');
      
      // Step 2: Test logout
      console.log('\nStep 2: Testing logout...');
      const logoutResponse = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        }
      });

      if (logoutResponse.ok) {
        console.log('✅ Logout API successful');
        
        // Step 3: Verify session is cleared
        console.log('\nStep 3: Verifying session is cleared...');
        const sessionResponse = await fetch(`${API_BASE}/auth/session`, {
          headers: { 'Cookie': cookies || '' }
        });

        if (sessionResponse.status === 401) {
          console.log('✅ Session properly cleared');
        } else {
          console.log('❌ Session still active');
        }
      } else {
        console.log('❌ Logout API failed');
      }
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n🏁 Logout test completed!');
}

// Run test
testLogout().catch(console.error);
