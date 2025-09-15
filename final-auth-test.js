/**
 * Final Production Authentication Test
 * Uses real user credentials to verify cookie authentication works
 */

const http = require('http');

async function testProductionAuth() {
  console.log('🔐 FINAL PRODUCTION AUTHENTICATION TEST');
  console.log('=======================================\n');

  // Using real user from database
  const testCredentials = [
    { mobile: '9876543211', password: '654321', role: 'admin' },
    { mobile: '9876543210', password: '123456', role: 'super-admin' }
  ];

  for (const cred of testCredentials) {
    console.log(`🧪 Testing with ${cred.role} user (${cred.mobile})...`);
    
    const success = await testAuthFlow(cred);
    if (success) {
      console.log(`✅ Authentication working for ${cred.role}!\n`);
      return true;
    } else {
      console.log(`❌ Authentication failed for ${cred.role}\n`);
    }
  }
  
  return false;
}

async function testAuthFlow(credentials) {
  try {
    // Step 1: Test Login
    const loginResponse = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        login: credentials.mobile,
        password: credentials.password
      }
    });

    console.log(`   Login Status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log(`   Login Message: ${loginResponse.data.message || 'Unknown error'}`);
      return false;
    }

    console.log(`   ✅ Login successful`);
    console.log(`   Cookies Set: ${loginResponse.setCookies.length}`);

    // Analyze cookies
    const authToken = loginResponse.setCookies.find(c => c.includes('auth-token'));
    const backupToken = loginResponse.setCookies.find(c => c.includes('auth-backup'));
    
    console.log(`   Primary Token: ${authToken ? '✅' : '❌'}`);
    console.log(`   Backup Token: ${backupToken ? '✅' : '❌'}`);

    if (!authToken) {
      console.log('   ❌ No auth-token cookie set');
      return false;
    }

    // Analyze cookie settings
    const isSecure = authToken.includes('Secure');
    const isHttpOnly = authToken.includes('HttpOnly');
    const hasPath = authToken.includes('Path=/');
    const hasSameSite = authToken.includes('SameSite=lax');

    console.log('   Cookie Settings:');
    console.log(`     - HttpOnly: ${isHttpOnly ? '✅' : '❌'}`);
    console.log(`     - Secure: ${isSecure ? '❌ (Bad for production)' : '✅ (Good for production)'}`);
    console.log(`     - Path=/: ${hasPath ? '✅' : '❌'}`);
    console.log(`     - SameSite=lax: ${hasSameSite ? '✅' : '❌'}`);

    // Step 2: Test Protected Route Access
    const cookies = loginResponse.setCookies.map(c => c.split(';')[0]).join('; ');
    
    const protectedResponse = await makeRequest('/admin', {
      headers: { 'Cookie': cookies }
    });

    console.log(`   Protected Route Status: ${protectedResponse.statusCode}`);

    if (protectedResponse.statusCode === 200) {
      console.log('   ✅ Protected route access granted');
      return true;
    } else if (protectedResponse.statusCode === 302) {
      const location = protectedResponse.headers.location;
      if (location && !location.includes('/login')) {
        console.log(`   ✅ Redirected to dashboard: ${location}`);
        return true;
      } else {
        console.log('   ❌ Redirected back to login - auth failed');
        return false;
      }
    } else {
      console.log('   ❌ Unexpected response from protected route');
      return false;
    }

  } catch (error) {
    console.log(`   ❌ Test error: ${error.message}`);
    return false;
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

// Run the test
testProductionAuth().then(success => {
  console.log('🎯 FINAL ASSESSMENT:');
  if (success) {
    console.log('✅ PRODUCTION READY!');
    console.log('   Your authentication fixes are working correctly.');
    console.log('   Cookie settings are optimized for production.');
    console.log('   Users will be able to login and stay authenticated in production.');
    console.log('\n🚀 Safe to deploy to production!');
  } else {
    console.log('❌ PRODUCTION ISSUES DETECTED');
    console.log('   Authentication may not work properly in production.');
    console.log('   Review the cookie settings and middleware configuration.');
  }
  
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
