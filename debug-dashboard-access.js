/**
 * Debug Dashboard Access Issues
 * Tests the complete authentication flow with detailed logging
 */

const http = require('http');

async function debugDashboardAccess() {
  console.log('🔍 DEBUGGING DASHBOARD ACCESS ISSUES');
  console.log('====================================\n');

  const testUser = { mobile: '9876543211', password: '654321', role: 'admin' };
  
  console.log(`Testing with ${testUser.role} user: ${testUser.mobile}`);
  
  // Step 1: Login and get cookies
  console.log('\n1️⃣ Performing Login...');
  const loginResult = await performLogin(testUser);
  
  if (!loginResult.success) {
    console.log('❌ Login failed, cannot test dashboard access');
    return;
  }
  
  console.log('✅ Login successful');
  console.log(`   User Role in Response: ${loginResult.userRole}`);
  console.log(`   Cookies: ${loginResult.cookies.length}`);
  
  // Step 2: Test dashboard access with detailed debugging
  console.log('\n2️⃣ Testing Dashboard Access...');
  await testDashboardAccess(loginResult.cookieString, '/admin');
  
  // Step 3: Test super-admin as well
  console.log('\n3️⃣ Testing Super-Admin...');
  const superAdminResult = await performLogin({ mobile: '9876543210', password: '123456', role: 'super-admin' });
  if (superAdminResult.success) {
    await testDashboardAccess(superAdminResult.cookieString, '/super-admin');
  }
}

async function performLogin(user) {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { login: user.mobile, password: user.password }
    });

    if (response.statusCode === 200) {
      const cookieString = response.setCookies.map(c => c.split(';')[0]).join('; ');
      return {
        success: true,
        cookies: response.setCookies,
        cookieString: cookieString,
        userRole: response.data.user ? response.data.user.role : 'unknown'
      };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testDashboardAccess(cookieString, dashboardPath) {
  console.log(`   Accessing: ${dashboardPath}`);
  console.log(`   Cookies: ${cookieString.substring(0, 100)}...`);
  
  try {
    const response = await makeRequest(dashboardPath, {
      headers: { 'Cookie': cookieString }
    });

    console.log(`   Response Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Access granted - dashboard loaded successfully');
    } else if (response.statusCode === 302) {
      const location = response.headers.location;
      console.log(`   🔄 Redirected to: ${location}`);
      
      if (location && location.includes('/login')) {
        console.log('   ❌ Redirected back to login - authentication failed');
        console.log('   🔍 This suggests JWT token verification is failing');
      } else {
        console.log('   ✅ Redirected to appropriate dashboard');
      }
    } else if (response.statusCode === 403) {
      console.log('   ❌ Access forbidden - role permission issue');
    } else {
      console.log(`   ❌ Unexpected response: ${response.statusCode}`);
    }

    // Check for any error messages in response
    if (response.data && typeof response.data === 'string' && response.data.includes('error')) {
      console.log(`   Error details: ${response.data.substring(0, 200)}`);
    }

  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
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

// Additional JWT debugging function
async function debugJWTToken() {
  console.log('\n🔐 JWT TOKEN ANALYSIS');
  console.log('=====================');
  
  const testUser = { mobile: '9876543211', password: '654321' };
  const loginResult = await performLogin(testUser);
  
  if (loginResult.success) {
    // Extract the JWT token from cookies
    const authCookie = loginResult.cookies.find(c => c.includes('auth-token'));
    if (authCookie) {
      const token = authCookie.split('=')[1].split(';')[0];
      console.log(`Token length: ${token.length}`);
      console.log(`Token starts with: ${token.substring(0, 20)}...`);
      
      // Try to decode the JWT payload (without verification)
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          console.log('JWT Payload:');
          console.log(`   User ID: ${payload.userId}`);
          console.log(`   Role: ${payload.role}`);
          console.log(`   Email: ${payload.email}`);
          console.log(`   Issued At: ${new Date(payload.iat * 1000)}`);
          console.log(`   Expires At: ${new Date(payload.exp * 1000)}`);
        }
      } catch (e) {
        console.log('❌ Could not decode JWT payload');
      }
    }
  }
}

// Run the debug
debugDashboardAccess()
  .then(() => debugJWTToken())
  .catch(console.error);
