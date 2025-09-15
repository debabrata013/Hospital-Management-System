/**
 * Simple Cookie Authentication Test
 * Tests if cookies are being set and read correctly in production
 */

const http = require('http');

async function testCookieFlow() {
  console.log('🍪 Testing Cookie Authentication Flow');
  console.log('=====================================\n');

  // Test 1: Check if login endpoint sets cookies properly
  console.log('1️⃣ Testing Login API Response Headers...');
  
  const loginData = JSON.stringify({
    login: '9999999999', // Using the test user mobile number
    password: 'test123'   // Using the test user password
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3500,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  try {
    const loginResponse = await new Promise((resolve, reject) => {
      const req = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            setCookies: res.headers['set-cookie'] || []
          });
        });
      });
      
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });

    console.log(`   Status Code: ${loginResponse.statusCode}`);
    console.log(`   Set-Cookie Headers: ${loginResponse.setCookies.length}`);
    
    if (loginResponse.setCookies.length > 0) {
      console.log('   Cookies being set:');
      loginResponse.setCookies.forEach(cookie => {
        const cookieName = cookie.split('=')[0];
        const hasSecure = cookie.includes('Secure');
        const hasHttpOnly = cookie.includes('HttpOnly');
        const hasSameSite = cookie.includes('SameSite');
        const hasPath = cookie.includes('Path');
        
        console.log(`     ✅ ${cookieName}`);
        console.log(`        - HttpOnly: ${hasHttpOnly ? '✅' : '❌'}`);
        console.log(`        - Secure: ${hasSecure ? '✅' : '❌'}`);
        console.log(`        - SameSite: ${hasSameSite ? '✅' : '❌'}`);
        console.log(`        - Path: ${hasPath ? '✅' : '❌'}`);
      });
    } else {
      console.log('   ❌ No cookies being set');
    }

    // Test 2: Check if middleware can read cookies
    console.log('\n2️⃣ Testing Middleware Cookie Detection...');
    
    if (loginResponse.statusCode === 200 && loginResponse.setCookies.length > 0) {
      // Extract cookies for next request
      const cookies = loginResponse.setCookies.map(cookie => {
        return cookie.split(';')[0]; // Get just the name=value part
      }).join('; ');

      console.log(`   Using cookies: ${cookies.substring(0, 100)}...`);

      // Test protected route with cookies
      const protectedOptions = {
        hostname: 'localhost',
        port: 3500,
        path: '/admin',
        method: 'GET',
        headers: {
          'Cookie': cookies
        }
      };

      const protectedResponse = await new Promise((resolve, reject) => {
        const req = http.request(protectedOptions, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: data
            });
          });
        });
        
        req.on('error', reject);
        req.end();
      });

      console.log(`   Protected Route Status: ${protectedResponse.statusCode}`);
      
      if (protectedResponse.statusCode === 200) {
        console.log('   ✅ Authentication successful - cookies working!');
      } else if (protectedResponse.statusCode === 302) {
        console.log(`   🔄 Redirected to: ${protectedResponse.headers.location}`);
        if (protectedResponse.headers.location && protectedResponse.headers.location.includes('/login')) {
          console.log('   ❌ Still redirecting to login - cookie authentication failed');
        } else {
          console.log('   ✅ Redirected to appropriate dashboard - authentication working!');
        }
      } else {
        console.log('   ❌ Unexpected response - authentication may have issues');
      }
    } else {
      console.log('   ⏭️ Skipping middleware test - login failed');
    }

    // Test 3: Production Readiness Assessment
    console.log('\n3️⃣ Production Readiness Assessment...');
    
    const hasAuthToken = loginResponse.setCookies.some(c => c.includes('auth-token'));
    const hasBackupToken = loginResponse.setCookies.some(c => c.includes('auth-backup'));
    const cookiesNotSecure = loginResponse.setCookies.every(c => !c.includes('Secure'));
    const cookiesHavePath = loginResponse.setCookies.every(c => c.includes('Path=/'));
    
    console.log(`   Primary auth-token cookie: ${hasAuthToken ? '✅' : '❌'}`);
    console.log(`   Backup auth-backup cookie: ${hasBackupToken ? '✅' : '❌'}`);
    console.log(`   Secure flag disabled: ${cookiesNotSecure ? '✅' : '❌'}`);
    console.log(`   Path set correctly: ${cookiesHavePath ? '✅' : '❌'}`);
    
    const productionReady = hasAuthToken && cookiesNotSecure && cookiesHavePath;
    
    console.log('\n🎯 FINAL ASSESSMENT:');
    if (productionReady) {
      console.log('✅ PRODUCTION READY - Cookie authentication should work in production');
      console.log('   - Cookies are being set with correct production settings');
      console.log('   - Secure flag is disabled for non-HTTPS environments');
      console.log('   - Path is set correctly for all routes');
    } else {
      console.log('⚠️ POTENTIAL ISSUES - Review cookie configuration');
      console.log('   - Check if all required cookies are being set');
      console.log('   - Verify cookie settings match production environment');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   - Make sure the server is running on port 3500');
    console.log('   - Check if the database connection is working');
    console.log('   - Verify user credentials exist in the database');
  }
}

testCookieFlow();
