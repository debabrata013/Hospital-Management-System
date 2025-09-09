#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

const testUsers = [
  {
    mobile: '9876543210',
    password: '123456',
    expectedRole: 'super-admin',
    expectedRedirect: '/super-admin',
    name: 'Super Administrator'
  },
  {
    mobile: '9876543211',
    password: 'admin123',
    expectedRole: 'admin',
    expectedRedirect: '/admin',
    name: 'Hospital Administrator'
  },
  {
    mobile: '9876543212',
    password: 'doctor123',
    expectedRole: 'doctor',
    expectedRedirect: '/doctor',
    name: 'Dr. Rajesh Kumar'
  },
  {
    mobile: '9876543213',
    password: 'patient123',
    expectedRole: 'patient',
    expectedRedirect: '/patient',
    name: 'Amit Sharma'
  }
];

async function testRoleBasedAuth() {
  console.log('🏥 Testing Role-Based Authentication & Navigation\n');

  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`Test ${i + 1}: ${user.name} (${user.expectedRole})`);
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: user.mobile,
          password: user.password
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        const isCorrectRole = result.user.role === user.expectedRole;
        const roleIcon = isCorrectRole ? '✅' : '❌';
        
        console.log(`${roleIcon} Login successful`);
        console.log(`   Mobile: ${user.mobile}`);
        console.log(`   Name: ${result.user.name}`);
        console.log(`   Role: ${result.user.role}`);
        console.log(`   Expected Redirect: ${user.expectedRedirect}`);
        console.log(`   Department: ${result.user.department}`);
        
        if (!isCorrectRole) {
          console.log(`   ❌ Role mismatch! Expected: ${user.expectedRole}, Got: ${result.user.role}`);
        }
      } else {
        console.log(`❌ Login failed: ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('📋 Role-Based Navigation Summary:');
  console.log('   • Super Admin → /super-admin (Full system access)');
  console.log('   • Admin → /admin (User & department management)');
  console.log('   • Doctor → /doctor (Patient care & prescriptions)');
  console.log('   • Patient → /patient (Personal records & appointments)');
  console.log('\n🏁 Role-based authentication tests completed!');
}

// Run tests
testRoleBasedAuth().catch(console.error);
