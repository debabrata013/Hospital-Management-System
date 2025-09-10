const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login: '9876543210',
        password: '123456'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
