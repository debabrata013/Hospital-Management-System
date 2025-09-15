// Debug JWT token contents
const { jwtVerify } = require('jose');

async function debugJWTToken() {
  console.log('🔍 DEBUGGING JWT TOKEN CONTENTS\n');

  try {
    // Test doctor login to get token
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: '9876543212',
        password: '111111'
      })
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    if (!cookies) {
      console.log('❌ No cookies received');
      return;
    }
    
    // Extract token from cookie
    const tokenMatch = cookies.match(/auth-token=([^;]+)/);
    if (!tokenMatch) {
      console.log('❌ No auth-token found in cookies');
      return;
    }
    
    const token = tokenMatch[1];
    console.log('📋 Token extracted:', token.substring(0, 50) + '...');
    
    // Decode JWT token
    const JWT_SECRET = new TextEncoder().encode('arogya-hospital-super-secret-jwt-key-2024-dev-environment');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    console.log('\n🔍 JWT Token Payload:');
    console.log('   userId:', payload.userId);
    console.log('   userIdString:', payload.userIdString);
    console.log('   name:', payload.name);
    console.log('   email:', payload.email);
    console.log('   role:', payload.role);
    console.log('   department:', payload.department);
    
    console.log('\n📊 ANALYSIS:');
    if (payload.role === 'doctor') {
      console.log('   ✅ JWT token contains correct role: doctor');
    } else {
      console.log('   ❌ JWT token contains wrong role:', payload.role);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugJWTToken();
