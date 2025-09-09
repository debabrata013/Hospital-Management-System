#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

async function testExactData() {
  console.log('🧪 Testing with exact working data\n');

  // Use the exact same data that worked in the previous test
  const exactData = {
    name: 'Frontend Test Admin',
    mobile: '9876543280',
    password: '123456'
  };

  console.log('Sending exact data:', JSON.stringify(exactData, null, 2));

  try {
    const response = await fetch(`${API_BASE}/super-admin/admins`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(exactData)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Success! Admin created');
    } else {
      console.log('❌ Failed with status:', response.status);
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

testExactData().catch(console.error);
