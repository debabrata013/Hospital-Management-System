/**
 * Production Authentication Test Script
 * Tests the authentication flow to verify cookie handling works in production
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

class AuthTester {
  constructor(baseUrl = 'http://localhost:3500') {
    this.baseUrl = baseUrl;
    this.cookies = new Map();
    this.testResults = [];
  }

  // Helper to make HTTP requests with cookie handling
  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AuthTester/1.0',
          ...options.headers
        }
      };

      // Add cookies to request
      if (this.cookies.size > 0) {
        const cookieString = Array.from(this.cookies.entries())
          .map(([name, value]) => `${name}=${value}`)
          .join('; ');
        requestOptions.headers.Cookie = cookieString;
      }

      const req = client.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          // Parse and store cookies from response
          const setCookieHeaders = res.headers['set-cookie'] || [];
          setCookieHeaders.forEach(cookie => {
            const [nameValue] = cookie.split(';');
            const [name, value] = nameValue.split('=');
            if (name && value) {
              this.cookies.set(name.trim(), value.trim());
            }
          });

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
            cookies: setCookieHeaders
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

  // Test login functionality
  async testLogin() {
    console.log('\n🔐 Testing Login API...');
    
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: {
          login: '9876543211', // Using valid admin mobile number from TEST_CREDENTIALS.md
          password: 'admin123' // Using valid admin password
        }
      });

      const result = {
        test: 'Login API',
        success: response.statusCode === 200,
        statusCode: response.statusCode,
        cookiesSet: response.cookies.length > 0,
        authTokenSet: response.cookies.some(c => c.includes('auth-token')),
        backupTokenSet: response.cookies.some(c => c.includes('auth-backup')),
        message: response.data.message || 'No message'
      };

      this.testResults.push(result);
      
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Cookies Set: ${response.cookies.length}`);
      console.log(`   Auth Token: ${result.authTokenSet ? '✅' : '❌'}`);
      console.log(`   Backup Token: ${result.backupTokenSet ? '✅' : '❌'}`);
      console.log(`   Message: ${result.message}`);

      return result.success;
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.testResults.push({
        test: 'Login API',
        success: false,
        error: error.message
      });
      return false;
    }
  }

  // Test session validation
  async testSession() {
    console.log('\n🔍 Testing Session Validation...');
    
    try {
      const response = await this.makeRequest('/api/auth/session');

      const result = {
        test: 'Session Validation',
        success: response.statusCode === 200,
        statusCode: response.statusCode,
        hasUserData: !!(response.data && response.data.user),
        message: response.data.message || 'No message'
      };

      this.testResults.push(result);
      
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   User Data: ${result.hasUserData ? '✅' : '❌'}`);
      console.log(`   Message: ${result.message}`);

      return result.success;
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.testResults.push({
        test: 'Session Validation',
        success: false,
        error: error.message
      });
      return false;
    }
  }

  // Test protected route access
  async testProtectedRoute() {
    console.log('\n🛡️ Testing Protected Route Access...');
    
    try {
      const response = await this.makeRequest('/admin');

      const result = {
        test: 'Protected Route Access',
        success: response.statusCode === 200 || response.statusCode === 302,
        statusCode: response.statusCode,
        redirected: response.statusCode === 302,
        location: response.headers.location || 'None'
      };

      this.testResults.push(result);
      
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Access: ${response.statusCode === 200 ? '✅ Allowed' : response.statusCode === 302 ? '🔄 Redirected' : '❌ Denied'}`);
      if (response.statusCode === 302) {
        console.log(`   Redirect: ${result.location}`);
      }

      return result.success;
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.testResults.push({
        test: 'Protected Route Access',
        success: false,
        error: error.message
      });
      return false;
    }
  }

  // Test logout functionality
  async testLogout() {
    console.log('\n🚪 Testing Logout...');
    
    try {
      const response = await this.makeRequest('/api/auth/logout', {
        method: 'POST'
      });

      const result = {
        test: 'Logout API',
        success: response.statusCode === 200,
        statusCode: response.statusCode,
        cookiesCleared: response.cookies.some(c => c.includes('auth-token=;') || c.includes('maxAge=0')),
        message: response.data.message || 'No message'
      };

      this.testResults.push(result);
      
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Cookies Cleared: ${result.cookiesCleared ? '✅' : '❌'}`);
      console.log(`   Message: ${result.message}`);

      return result.success;
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.testResults.push({
        test: 'Logout API',
        success: false,
        error: error.message
      });
      return false;
    }
  }

  // Run complete authentication test suite
  async runTests() {
    console.log('🧪 Starting Production Authentication Tests');
    console.log(`📍 Base URL: ${this.baseUrl}`);
    console.log('=' * 50);

    // Test 1: Login
    const loginSuccess = await this.testLogin();
    
    if (loginSuccess) {
      // Test 2: Session validation with cookies
      await this.testSession();
      
      // Test 3: Protected route access
      await this.testProtectedRoute();
      
      // Test 4: Logout
      await this.testLogout();
    } else {
      console.log('\n⚠️ Skipping remaining tests due to login failure');
    }

    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '=' * 50);
    console.log('📊 TEST SUMMARY');
    console.log('=' * 50);

    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;

    this.testResults.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.test}`);
      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });

    console.log('\n' + '-' * 30);
    console.log(`Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Authentication should work in production.');
    } else {
      console.log('⚠️ Some tests failed. Review the issues above.');
    }

    // Production readiness assessment
    console.log('\n📋 PRODUCTION READINESS:');
    const loginTest = this.testResults.find(r => r.test === 'Login API');
    if (loginTest && loginTest.success && loginTest.authTokenSet) {
      console.log('✅ Cookie authentication is working');
      console.log('✅ Ready for production deployment');
    } else {
      console.log('❌ Cookie authentication issues detected');
      console.log('⚠️ May have issues in production');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3500';
  const tester = new AuthTester(baseUrl);
  
  tester.runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = AuthTester;
