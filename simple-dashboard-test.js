/**
 * Simple Dashboard Access Test
 */

const http = require('http');

async function testDashboard() {
  // Login first
  const loginData = JSON.stringify({
    login: '9876543211',
    password: '654321'
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

  console.log('Testing admin dashboard access...');

  const loginResponse = await new Promise((resolve, reject) => {
    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          cookies: res.headers['set-cookie'] || [],
          data: data
        });
      });
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  console.log(`Login status: ${loginResponse.statusCode}`);
  console.log(`Cookies: ${loginResponse.cookies.length}`);

  if (loginResponse.statusCode === 200) {
    // Test dashboard access
    const cookies = loginResponse.cookies.map(c => c.split(';')[0]).join('; ');
    
    const dashboardOptions = {
      hostname: 'localhost',
      port: 3500,
      path: '/admin',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    };

    const dashboardResponse = await new Promise((resolve, reject) => {
      const req = http.request(dashboardOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            location: res.headers.location
          });
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`Dashboard status: ${dashboardResponse.statusCode}`);
    if (dashboardResponse.location) {
      console.log(`Redirect: ${dashboardResponse.location}`);
    }

    if (dashboardResponse.statusCode === 200) {
      console.log('✅ Dashboard access successful');
    } else if (dashboardResponse.statusCode === 302) {
      if (dashboardResponse.location && dashboardResponse.location.includes('/login')) {
        console.log('❌ Redirected to login - auth failed');
      } else {
        console.log('✅ Redirected to appropriate page');
      }
    } else {
      console.log('❌ Dashboard access failed');
    }
  }
}

testDashboard().catch(console.error);
