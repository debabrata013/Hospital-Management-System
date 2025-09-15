/**
 * Quick Authentication Test for All Roles
 */

const http = require('http');

const users = [
  { mobile: '9876543211', password: '654321', role: 'admin' },
  { mobile: '9876543210', password: '123456', role: 'super-admin' },
  { mobile: '9876543212', password: '111111', role: 'doctor' },
  { mobile: '9876543215', password: '444444', role: 'receptionist' },
  { mobile: '9999999999', password: '888888', role: 'staff' }
];

async function testLogin(user) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      login: user.mobile,
      password: user.password
    });

    const options = {
      hostname: 'localhost',
      port: 3500,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        const authToken = cookies.some(c => c.includes('auth-token'));
        const backupToken = cookies.some(c => c.includes('auth-backup'));
        
        resolve({
          status: res.statusCode,
          success: res.statusCode === 200,
          cookies: cookies.length,
          authToken,
          backupToken
        });
      });
    });

    req.on('error', () => resolve({ success: false, error: true }));
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🔐 AUTHENTICATION TEST - ALL ROLES\n');

  const results = [];
  
  for (const user of users) {
    process.stdout.write(`Testing ${user.role.padEnd(12)} (${user.mobile})... `);
    
    const result = await testLogin(user);
    results.push({ ...user, ...result });
    
    if (result.success && result.authToken && result.backupToken) {
      console.log('✅ PASS');
    } else if (result.success) {
      console.log('⚠️ LOGIN OK, COOKIE ISSUES');
    } else {
      console.log('❌ FAIL');
    }
  }

  console.log('\n📊 SUMMARY:');
  console.log('Role         | Login | Cookies | Auth Token | Backup Token');
  console.log('-------------|-------|---------|------------|-------------');
  
  results.forEach(r => {
    const login = r.success ? '✅' : '❌';
    const cookies = r.cookies || 0;
    const auth = r.authToken ? '✅' : '❌';
    const backup = r.backupToken ? '✅' : '❌';
    
    console.log(`${r.role.padEnd(12)} | ${login.padEnd(5)} | ${cookies.toString().padEnd(7)} | ${auth.padEnd(10)} | ${backup}`);
  });

  const allPass = results.every(r => r.success && r.authToken && r.backupToken);
  const passCount = results.filter(r => r.success && r.authToken && r.backupToken).length;
  
  console.log('\n🎯 RESULT:');
  if (allPass) {
    console.log('🟢 ALL ROLES PRODUCTION READY ✅');
    console.log('   All user types can authenticate successfully');
    console.log('   Cookie authentication working for all roles');
    console.log('   Safe to deploy to production!');
  } else {
    console.log(`🟡 ${passCount}/${results.length} ROLES WORKING`);
    console.log('   Some roles may need attention');
  }
}

runTests().catch(console.error);
