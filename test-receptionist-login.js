const fetch = require('node-fetch');

async function testReceptionistLogin() {
  try {
    console.log('🧪 Testing receptionist login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login: '9876543215',
        password: '444444'
      })
    });
    
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User Role:', data.user?.role);
      console.log('User Name:', data.user?.name);
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testReceptionistLogin();
