// Debug session endpoint directly
const { jwtVerify } = require('jose');

async function debugSessionEndpoint() {
  console.log('🔍 DEBUGGING SESSION ENDPOINT\n');

  try {
    // First login to get token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543212',
        password: '111111'
      })
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('1. Login cookies:', cookies);
    
    // Call session endpoint
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session', {
      headers: { 'Cookie': cookies }
    });
    
    const sessionResult = await sessionResponse.json();
    console.log('2. Session response:', sessionResult);
    
    // Extract and decode token manually
    const tokenMatch = cookies.match(/auth-token=([^;]+)/);
    const token = tokenMatch[1];
    
    const JWT_SECRET = new TextEncoder().encode('arogya-hospital-super-secret-jwt-key-2024-dev-environment');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    console.log('3. Direct JWT decode:');
    console.log('   role from JWT:', payload.role);
    console.log('   role from session API:', sessionResult.user.role);
    
    if (payload.role === sessionResult.user.role) {
      console.log('   ✅ Roles match');
    } else {
      console.log('   ❌ ROLE MISMATCH!');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugSessionEndpoint();
