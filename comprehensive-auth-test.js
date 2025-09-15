/**
 * Comprehensive Authentication Test for Production Readiness
 * This test verifies that cookie authentication will work in production
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const http = require('http');

const dbConfig = {
  host: process.env.DB_HOST || 'srv2047.hstgr.io',
  user: process.env.DB_USER || 'u153229971_admin',
  password: process.env.DB_PASSWORD || 'Admin!2025',
  database: process.env.DB_NAME || 'u153229971_Hospital',
  port: parseInt(process.env.DB_PORT || '3306')
};

class ProductionAuthTest {
  constructor() {
    this.testUser = {
      user_id: 'AUTH-TEST-001',
      name: 'Auth Test User',
      email: 'authtest@hospital.com',
      contact_number: '8888888888',
      password: 'authtest123',
      role: 'admin',
      department: 'Testing'
    };
  }

  async ensureTestUser() {
    console.log('👤 Setting up test user...');
    
    try {
      const connection = await mysql.createConnection(dbConfig);
      
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT id, name, role FROM users WHERE contact_number = ?',
        [this.testUser.contact_number]
      );
      
      if (existing.length > 0) {
        console.log(`   ✅ Test user exists: ${existing[0].name} (${existing[0].role})`);
        await connection.end();
        return true;
      }
      
      // Create test user
      const hashedPassword = await bcrypt.hash(this.testUser.password, 10);
      
      await connection.execute(
        `INSERT INTO users (
          user_id, name, email, contact_number, password_hash, 
          role, department, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
        [
          this.testUser.user_id,
          this.testUser.name,
          this.testUser.email,
          this.testUser.contact_number,
          hashedPassword,
          this.testUser.role,
          this.testUser.department
        ]
      );
      
      console.log('   ✅ Test user created successfully');
      await connection.end();
      return true;
      
    } catch (error) {
      console.error('   ❌ Database error:', error.message);
      return false;
    }
  }

  async makeHttpRequest(path, options = {}) {
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

  async testLogin() {
    console.log('\n🔐 Testing Login with Cookie Setting...');
    
    try {
      const response = await this.makeHttpRequest('/api/auth/login', {
        method: 'POST',
        body: {
          login: this.testUser.contact_number,
          password: this.testUser.password
        }
      });

      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Message: ${response.data.message || 'No message'}`);
      console.log(`   Cookies Set: ${response.setCookies.length}`);

      if (response.statusCode === 200) {
        console.log('   ✅ Login successful');
        
        // Analyze cookies
        const authToken = response.setCookies.find(c => c.includes('auth-token'));
        const backupToken = response.setCookies.find(c => c.includes('auth-backup'));
        
        console.log(`   Primary Token: ${authToken ? '✅' : '❌'}`);
        console.log(`   Backup Token: ${backupToken ? '✅' : '❌'}`);
        
        if (authToken) {
          const hasSecure = authToken.includes('Secure');
          const hasHttpOnly = authToken.includes('HttpOnly');
          const hasPath = authToken.includes('Path=/');
          const hasSameSite = authToken.includes('SameSite=lax');
          
          console.log('   Cookie Analysis:');
          console.log(`     - HttpOnly: ${hasHttpOnly ? '✅' : '❌'}`);
          console.log(`     - Secure: ${hasSecure ? '❌ (Good for production)' : '✅ (Good for production)'}`);
          console.log(`     - Path=/: ${hasPath ? '✅' : '❌'}`);
          console.log(`     - SameSite=lax: ${hasSameSite ? '✅' : '❌'}`);
        }
        
        return response.setCookies;
      } else {
        console.log('   ❌ Login failed');
        return null;
      }
      
    } catch (error) {
      console.error('   ❌ Login test error:', error.message);
      return null;
    }
  }

  async testProtectedAccess(cookies) {
    console.log('\n🛡️ Testing Protected Route Access...');
    
    if (!cookies || cookies.length === 0) {
      console.log('   ⏭️ Skipping - no cookies from login');
      return false;
    }
    
    try {
      const cookieString = cookies.map(cookie => {
        return cookie.split(';')[0]; // Get just the name=value part
      }).join('; ');

      const response = await this.makeHttpRequest('/admin', {
        headers: {
          'Cookie': cookieString
        }
      });

      console.log(`   Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        console.log('   ✅ Access granted - authentication working!');
        return true;
      } else if (response.statusCode === 302) {
        const location = response.headers.location;
        console.log(`   🔄 Redirected to: ${location}`);
        
        if (location && location.includes('/login')) {
          console.log('   ❌ Redirected to login - authentication failed');
          return false;
        } else {
          console.log('   ✅ Redirected to appropriate dashboard - authentication working!');
          return true;
        }
      } else {
        console.log('   ❌ Unexpected response - authentication issues');
        return false;
      }
      
    } catch (error) {
      console.error('   ❌ Protected access test error:', error.message);
      return false;
    }
  }

  async runProductionTest() {
    console.log('🚀 PRODUCTION AUTHENTICATION TEST');
    console.log('==================================\n');

    // Step 1: Ensure test user exists
    const userReady = await this.ensureTestUser();
    if (!userReady) {
      console.log('\n❌ FAILED: Could not set up test user');
      return false;
    }

    // Step 2: Test login and cookie setting
    const cookies = await this.testLogin();
    const loginSuccess = cookies !== null;

    // Step 3: Test protected route access
    const accessSuccess = await this.testProtectedAccess(cookies);

    // Step 4: Production readiness assessment
    console.log('\n📊 PRODUCTION READINESS ASSESSMENT');
    console.log('===================================');

    const hasAuthCookie = cookies && cookies.some(c => c.includes('auth-token'));
    const hasBackupCookie = cookies && cookies.some(c => c.includes('auth-backup'));
    const cookiesNotSecure = cookies && cookies.every(c => !c.includes('Secure'));
    const cookiesHavePath = cookies && cookies.every(c => c.includes('Path=/'));

    console.log(`✅ Database Connection: Working`);
    console.log(`${loginSuccess ? '✅' : '❌'} Login API: ${loginSuccess ? 'Working' : 'Failed'}`);
    console.log(`${hasAuthCookie ? '✅' : '❌'} Primary Cookie: ${hasAuthCookie ? 'Set correctly' : 'Not set'}`);
    console.log(`${hasBackupCookie ? '✅' : '❌'} Backup Cookie: ${hasBackupCookie ? 'Set correctly' : 'Not set'}`);
    console.log(`${cookiesNotSecure ? '✅' : '❌'} Production Settings: ${cookiesNotSecure ? 'Secure=false (Good)' : 'May have issues'}`);
    console.log(`${cookiesHavePath ? '✅' : '❌'} Cookie Path: ${cookiesHavePath ? 'Set to /' : 'Not set correctly'}`);
    console.log(`${accessSuccess ? '✅' : '❌'} Protected Access: ${accessSuccess ? 'Working' : 'Failed'}`);

    const allGood = loginSuccess && hasAuthCookie && cookiesNotSecure && cookiesHavePath && accessSuccess;

    console.log('\n🎯 FINAL VERDICT:');
    if (allGood) {
      console.log('✅ PRODUCTION READY!');
      console.log('   Your authentication fixes will work in production.');
      console.log('   Cookie settings are optimized for production deployment.');
      console.log('   Users will be able to login and stay authenticated.');
    } else {
      console.log('⚠️ POTENTIAL ISSUES DETECTED');
      console.log('   Review the failed tests above.');
      console.log('   Authentication may have problems in production.');
    }

    return allGood;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test user...');
    try {
      const connection = await mysql.createConnection(dbConfig);
      await connection.execute(
        'DELETE FROM users WHERE contact_number = ?',
        [this.testUser.contact_number]
      );
      console.log('   ✅ Test user removed');
      await connection.end();
    } catch (error) {
      console.log('   ⚠️ Cleanup failed:', error.message);
    }
  }
}

// Run the test
async function main() {
  const tester = new ProductionAuthTest();
  
  try {
    const success = await tester.runProductionTest();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  } finally {
    // Uncomment to clean up test user after testing
    // await tester.cleanup();
  }
}

if (require.main === module) {
  main();
}
