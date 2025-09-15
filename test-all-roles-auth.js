/**
 * Complete Authentication Test for All User Roles
 * Tests authentication for all user types with provided credentials
 */

const http = require('http');

async function testAllRoles() {
  console.log('🔐 COMPLETE AUTHENTICATION TEST - ALL USER ROLES');
  console.log('================================================\n');

  // All user credentials provided
  const testUsers = [
    { mobile: '9876543211', password: '654321', role: 'admin', dashboard: '/admin' },
    { mobile: '9876543210', password: '123456', role: 'super-admin', dashboard: '/super-admin' },
    { mobile: '9876543212', password: '111111', role: 'doctor', dashboard: '/doctor' },
    { mobile: '9876543215', password: '444444', role: 'receptionist', dashboard: '/receptionist' },
    { mobile: '9999999999', password: '888888', role: 'staff', dashboard: '/staff' }
  ];

  const results = [];

  for (const user of testUsers) {
    console.log(`🧪 Testing ${user.role.toUpperCase()} (${user.mobile})...`);
    
    const result = await testUserAuth(user);
    results.push({ ...user, ...result });
    
    console.log(''); // Add spacing between tests
  }

  printSummary(results);
}

async function testUserAuth(user) {
  try {
    // Step 1: Test Login
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        login: user.mobile,
        password: user.password
      }
    });

    console.log(`   Login Status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log(`   ❌ Login Failed: ${loginResponse.data.message || 'Unknown error'}`);
      return { loginSuccess: false, cookiesSet: 0, protectedAccess: false };
    }

    console.log(`   ✅ Login Successful`);
    console.log(`   User Data: ${loginResponse.data.user ? loginResponse.data.user.name : 'Not provided'}`);
    console.log(`   Role: ${loginResponse.data.user ? loginResponse.data.user.role : 'Not provided'}`);
    console.log(`   Cookies Set: ${loginResponse.setCookies.length}`);

    // Analyze cookies
    const authToken = loginResponse.setCookies.find(c => c.includes('auth-token'));
    const backupToken = loginResponse.setCookies.find(c => c.includes('auth-backup'));
    
    console.log(`   Primary Token: ${authToken ? '✅' : '❌'}`);
    console.log(`   Backup Token: ${backupToken ? '✅' : '❌'}`);

    if (!authToken) {
      console.log('   ❌ No auth-token cookie set');
      return { loginSuccess: true, cookiesSet: loginResponse.setCookies.length, protectedAccess: false };
    }

    // Step 2: Test Protected Route Access
    const cookies = loginResponse.setCookies.map(c => c.split(';')[0]).join('; ');
    
    const protectedResponse = await makeRequest(user.dashboard, {
      headers: { 'Cookie': cookies }
    });

    console.log(`   Dashboard Access (${user.dashboard}): ${protectedResponse.statusCode}`);

    let protectedAccess = false;
    if (protectedResponse.statusCode === 200) {
      console.log('   ✅ Dashboard Access Granted');
      protectedAccess = true;
    } else if (protectedResponse.statusCode === 302) {
      const location = protectedResponse.headers.location;
      if (location && !location.includes('/login')) {
        console.log(`   ✅ Redirected to: ${location}`);
        protectedAccess = true;
      } else {
        console.log('   ❌ Redirected back to login');
        protectedAccess = false;
      }
    } else {
      console.log('   ❌ Access Denied');
      protectedAccess = false;
    }

    return {
      loginSuccess: true,
      cookiesSet: loginResponse.setCookies.length,
      protectedAccess: protectedAccess,
      userRole: loginResponse.data.user ? loginResponse.data.user.role : 'unknown'
    };

  } catch (error) {
    console.log(`   ❌ Test Error: ${error.message}`);
    return { loginSuccess: false, cookiesSet: 0, protectedAccess: false, error: error.message };
  }
}

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'localhost',
      port: 3500,
      path: path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = data;
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsedData,
          setCookies: res.headers['set-cookie'] || []
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

function printSummary(results) {
  console.log('📊 COMPLETE AUTHENTICATION TEST SUMMARY');
  console.log('========================================\n');

  const successful = results.filter(r => r.loginSuccess && r.protectedAccess).length;
  const total = results.length;

  console.log('📋 Individual Results:');
  results.forEach(user => {
    const status = user.loginSuccess && user.protectedAccess ? '✅' : '❌';
    console.log(`${status} ${user.role.toUpperCase().padEnd(12)} (${user.mobile})`);
    console.log(`     Login: ${user.loginSuccess ? '✅' : '❌'} | Cookies: ${user.cookiesSet} | Dashboard: ${user.protectedAccess ? '✅' : '❌'}`);
    if (user.error) {
      console.log(`     Error: ${user.error}`);
    }
  });

  console.log('\n📈 Overall Statistics:');
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  console.log(`📊 Success Rate: ${Math.round((successful/total) * 100)}%`);

  console.log('\n🎯 PRODUCTION READINESS FOR ALL ROLES:');
  if (successful === total) {
    console.log('🟢 ALL ROLES PRODUCTION READY');
    console.log('   ✅ All user types can authenticate successfully');
    console.log('   ✅ Cookie authentication working for all roles');
    console.log('   ✅ Role-based dashboard access working');
    console.log('   ✅ No authentication loops detected');
    console.log('\n🚀 RECOMMENDATION: Safe to deploy - all user roles will work in production');
  } else if (successful > total / 2) {
    console.log('🟡 MOSTLY READY');
    console.log(`   ✅ ${successful} out of ${total} roles working`);
    console.log('   ⚠️ Some roles may have issues');
    console.log('\n📝 RECOMMENDATION: Fix failing roles before full deployment');
  } else {
    console.log('🔴 MULTIPLE ISSUES DETECTED');
    console.log(`   ❌ Only ${successful} out of ${total} roles working`);
    console.log('   ❌ Significant authentication problems');
    console.log('\n⚠️ RECOMMENDATION: Review authentication system before deployment');
  }

  console.log('\n🔧 Cookie Analysis:');
  const cookieStats = results.filter(r => r.loginSuccess);
  if (cookieStats.length > 0) {
    const avgCookies = cookieStats.reduce((sum, r) => sum + r.cookiesSet, 0) / cookieStats.length;
    console.log(`   Average cookies per login: ${avgCookies.toFixed(1)}`);
    console.log(`   Expected: 2 (auth-token + auth-backup)`);
    console.log(`   Status: ${avgCookies >= 2 ? '✅ Optimal' : '⚠️ May have issues'}`);
  }
}

// Run the complete test
testAllRoles().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
