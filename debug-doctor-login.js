// Debug script to test doctor login and role detection
const fetch = globalThis.fetch || require('node-fetch');

async function debugDoctorLogin() {
  console.log('🔍 DEBUGGING DOCTOR LOGIN ROLE ISSUE\n');

  try {
    // Test doctor login
    console.log('1. Testing doctor login...');
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
      console.log(`   📋 Login response user:`, loginResult.user);
      console.log(`   🎯 Login response role: ${loginResult.user.role}`);
      
      // Test session endpoint to see what role is returned
      console.log('\n2. Testing session endpoint...');
      const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
        headers: { 'Cookie': cookies }
      });
      
      if (sessionResponse.ok) {
        const sessionResult = await sessionResponse.json();
        console.log(`   📋 Session response user:`, sessionResult.user);
        console.log(`   🎯 Session response role: ${sessionResult.user.role}`);
        
        // Compare roles
        if (loginResult.user.role === sessionResult.user.role) {
          console.log('   ✅ Roles match between login and session');
        } else {
          console.log('   ❌ ROLE MISMATCH DETECTED!');
          console.log(`   Login role: ${loginResult.user.role}`);
          console.log(`   Session role: ${sessionResult.user.role}`);
        }
      } else {
        console.log(`   ❌ Session check failed: Status ${sessionResponse.status}`);
      }
      
      // Test accessing doctor dashboard
      console.log('\n3. Testing doctor dashboard access...');
      const doctorResponse = await fetch('http://localhost:3000/doctor', {
        headers: { 'Cookie': cookies }
      });
      
      console.log(`   📊 Doctor dashboard access: Status ${doctorResponse.status}`);
      
      if (doctorResponse.status === 200) {
        console.log('   ✅ Doctor can access doctor dashboard');
      } else {
        console.log('   ❌ Doctor cannot access doctor dashboard');
        const errorText = await doctorResponse.text();
        if (errorText.includes('Access Denied')) {
          console.log('   🚫 Access Denied page shown');
        }
      }
      
    } else {
      console.log(`   ❌ Login failed: Status ${loginResponse.status}`);
      console.log(`   📋 Response:`, loginResult);
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugDoctorLogin();
