// Test pharmacy user login
// Hospital Management System - Arogya Hospital

const fetch = require('node-fetch');

async function testPharmacyLogin() {
  try {
    console.log('Testing pharmacy user login...');

    const loginData = {
      email: 'p@gmail.com',
      password: 'p@gmail.com'
    };

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response:', result);

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User:', result.user);
    } else {
      console.log('❌ Login failed:', result.message);
    }

  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

// Run the test
testPharmacyLogin();
