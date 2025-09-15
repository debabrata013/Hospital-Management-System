const fetch = require('node-fetch');

async function testAPILogin() {
  console.log('🧪 Testing API login endpoint...');
  
  const loginData = {
    login: '9876543211',
    password: '654321'
  };
  
  try {
    console.log('📤 Sending login request:', loginData);
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers));
    
    const responseData = await response.text();
    console.log(`📋 Response body:`, responseData);
    
    if (response.ok) {
      console.log('✅ API LOGIN SUCCESS!');
      try {
        const jsonData = JSON.parse(responseData);
        console.log('🎯 Parsed response:', jsonData);
      } catch (e) {
        console.log('⚠️ Could not parse JSON response');
      }
    } else {
      console.log('❌ API LOGIN FAILED');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('💡 Make sure the development server is running: npm run dev');
  }
}

testAPILogin();
