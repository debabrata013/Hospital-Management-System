#!/usr/bin/env node

const API_BASE = 'http://localhost:3000/api';

const allUsers = [
  {
    mobile: '9876543210',
    password: '123456',
    role: 'super-admin',
    redirect: '/super-admin',
    name: 'Super Administrator',
    emoji: '👑'
  },
  {
    mobile: '9876543211',
    password: '654321',
    role: 'admin',
    redirect: '/admin',
    name: 'Hospital Administrator',
    emoji: '🏢'
  },
  {
    mobile: '9876543212',
    password: '111111',
    role: 'doctor',
    redirect: '/doctor',
    name: 'Dr. Rajesh Kumar',
    emoji: '👨‍⚕️'
  },
  {
    mobile: '9876543213',
    password: '222222',
    role: 'pharmacy',
    redirect: '/pharmacy',
    name: 'Pharmacist Priya',
    emoji: '💊'
  },
  {
    mobile: '9876543214',
    password: '333333',
    role: 'staff',
    redirect: '/staff',
    name: 'Staff Nurse Sunita',
    emoji: '👩‍⚕️'
  },
  {
    mobile: '9876543215',
    password: '444444',
    role: 'receptionist',
    redirect: '/receptionist',
    name: 'Receptionist Kavita',
    emoji: '🏪'
  },
  {
    mobile: '9876543216',
    password: '555555',
    role: 'patient',
    redirect: '/patient',
    name: 'Patient Amit Sharma',
    emoji: '🤒'
  }
];

async function testAllDashboards() {
  console.log('🏥 Testing All Dashboard Users with 10-digit Mobile + 6-digit Password\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    console.log(`${user.emoji} Test ${i + 1}: ${user.name}`);
    console.log(`   Mobile: ${user.mobile} | Password: ${user.password}`);
    
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
        const isCorrectRole = result.user.role === user.role;
        
        if (isCorrectRole) {
          console.log(`   ✅ SUCCESS - Role: ${result.user.role} → ${user.redirect}`);
          successCount++;
        } else {
          console.log(`   ❌ ROLE MISMATCH - Expected: ${user.role}, Got: ${result.user.role}`);
          failCount++;
        }
      } else {
        console.log(`   ❌ LOGIN FAILED - ${result.message}`);
        failCount++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      failCount++;
    }
    
    console.log('');
  }

  console.log('📊 SUMMARY:');
  console.log(`   ✅ Successful logins: ${successCount}/${allUsers.length}`);
  console.log(`   ❌ Failed logins: ${failCount}/${allUsers.length}`);
  
  if (successCount === allUsers.length) {
    console.log('\n🎉 ALL DASHBOARDS READY! सभी users काम कर रहे हैं!');
  } else {
    console.log('\n⚠️  Some users need fixing');
  }

  console.log('\n📋 QUICK REFERENCE:');
  allUsers.forEach(user => {
    console.log(`   ${user.emoji} ${user.mobile} / ${user.password} → ${user.redirect}`);
  });
}

// Run tests
testAllDashboards().catch(console.error);
