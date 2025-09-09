#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testAdminLogout() {
  console.log('🔐 Testing Admin Logout Functionality\n');

  // Step 1: Login as admin
  console.log('Step 1: Logging in as admin...');
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543288', // Test admin we created
        password: '123456'
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful');
      console.log(`   User: ${loginData.user.name}`);
      console.log(`   Role: ${loginData.user.role}`);
      console.log(`   Mobile: ${loginData.user.mobile}`);
      
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
      const loginData = await loginResponse.json();
      console.log('❌ Admin login failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n🏁 Admin logout test completed!');
  console.log('\n📋 What was fixed:');
  console.log('   ✅ Added useAuth import to admin dashboard');
  console.log('   ✅ Added { user, logout } = useAuth() hook');
  console.log('   ✅ Updated handleLogout to call logout() instead of router.push()');
  console.log('   ✅ Added current user name to sidebar');
  console.log('   ✅ Shows user name and role in sidebar header');
}

// Run test
testAdminLogout().catch(console.error);
