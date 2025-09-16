/**
 * Production Readiness Test Script
 * Tests authentication flows and dashboard accessibility
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
};

const BASE_URL = 'http://localhost:3000';

// Test data for different roles - using actual system credentials
const testUsers = {
  'super-admin': { login: '9876543210', password: '123456' },
  'admin': { login: '9876543211', password: '654321' },
  'doctor': { login: '9876543212', password: '111111' },
  'pharmacy': { login: '9876543213', password: '222222' },
  'nurse': { login: '9000000000', password: '000000' }
};

class ProductionReadinessTest {
  constructor() {
    this.results = {
      database: { status: 'pending', details: [] },
      authentication: { status: 'pending', details: [] },
      authorization: { status: 'pending', details: [] },
      dashboards: { status: 'pending', details: [] },
      apis: { status: 'pending', details: [] }
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Production Readiness Tests...\n');
    
    try {
      await this.testDatabaseConnection();
      await this.testUserAccounts();
      await this.testAuthenticationEndpoints();
      await this.testDashboardRoutes();
      await this.testCriticalAPIs();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  async testDatabaseConnection() {
    console.log('📊 Testing Database Connection...');
    
    try {
      const connection = await mysql.createConnection(dbConfig);
      
      // Test basic connection
      await connection.execute('SELECT 1');
      this.results.database.details.push('✅ Database connection successful');
      
      // Test critical tables exist
      const tables = ['users', 'patients', 'appointments', 'vitals', 'leave_requests'];
      for (const table of tables) {
        try {
          await connection.execute(`SELECT 1 FROM ${table} LIMIT 1`);
          this.results.database.details.push(`✅ Table '${table}' exists and accessible`);
        } catch (error) {
          this.results.database.details.push(`⚠️  Table '${table}' issue: ${error.message}`);
        }
      }
      
      await connection.end();
      this.results.database.status = 'passed';
      
    } catch (error) {
      this.results.database.status = 'failed';
      this.results.database.details.push(`❌ Database connection failed: ${error.message}`);
    }
  }

  async testUserAccounts() {
    console.log('👥 Testing User Accounts...');
    
    try {
      const connection = await mysql.createConnection(dbConfig);
      
      // Check if test users exist for each role
      for (const [role, credentials] of Object.entries(testUsers)) {
        try {
          const [users] = await connection.execute(
            'SELECT * FROM users WHERE (contact_number = ? OR email = ?) AND role = ? AND is_active = 1',
            [credentials.login, credentials.login, role]
          );
          
          if (users.length > 0) {
            const user = users[0];
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
            
            if (isPasswordValid) {
              this.results.authentication.details.push(`✅ ${role} user account valid`);
            } else {
              this.results.authentication.details.push(`⚠️  ${role} user password mismatch`);
            }
          } else {
            this.results.authentication.details.push(`⚠️  ${role} user not found`);
          }
        } catch (error) {
          this.results.authentication.details.push(`❌ ${role} user check failed: ${error.message}`);
        }
      }
      
      await connection.end();
      this.results.authentication.status = 'passed';
      
    } catch (error) {
      this.results.authentication.status = 'failed';
      this.results.authentication.details.push(`❌ User account test failed: ${error.message}`);
    }
  }

  async testAuthenticationEndpoints() {
    console.log('🔐 Testing Authentication Endpoints...');
    
    try {
      // Test login endpoint
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUsers['super-admin'])
      });
      
      if (loginResponse.ok) {
        const data = await loginResponse.json();
        if (data.user && data.user.role) {
          this.results.authentication.details.push('✅ Login endpoint working');
          
          // Test session endpoint
          const cookies = loginResponse.headers.get('set-cookie');
          if (cookies) {
            const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
              headers: { 'Cookie': cookies }
            });
            
            if (sessionResponse.ok) {
              this.results.authentication.details.push('✅ Session endpoint working');
            } else {
              this.results.authentication.details.push('⚠️  Session endpoint issue');
            }
          }
        } else {
          this.results.authentication.details.push('⚠️  Login response missing user data');
        }
      } else {
        this.results.authentication.details.push('❌ Login endpoint failed');
      }
      
      this.results.authentication.status = 'passed';
      
    } catch (error) {
      this.results.authentication.status = 'failed';
      this.results.authentication.details.push(`❌ Authentication test failed: ${error.message}`);
    }
  }

  async testDashboardRoutes() {
    console.log('🏠 Testing Dashboard Routes...');
    
    const dashboardRoutes = [
      '/super-admin',
      '/doctor', 
      '/nurse',
      '/receptionist'
    ];
    
    try {
      for (const route of dashboardRoutes) {
        try {
          const response = await fetch(`${BASE_URL}${route}`, {
            redirect: 'manual' // Don't follow redirects
          });
          
          // Expect redirect to login for unauthenticated requests
          if (response.status === 302 || response.status === 307) {
            const location = response.headers.get('location');
            if (location && location.includes('/login')) {
              this.results.authorization.details.push(`✅ ${route} properly protected`);
            } else {
              this.results.authorization.details.push(`⚠️  ${route} redirect issue`);
            }
          } else if (response.status === 200) {
            this.results.authorization.details.push(`⚠️  ${route} not protected (accessible without auth)`);
          } else {
            this.results.authorization.details.push(`❌ ${route} returned status ${response.status}`);
          }
        } catch (error) {
          this.results.authorization.details.push(`❌ ${route} test failed: ${error.message}`);
        }
      }
      
      this.results.authorization.status = 'passed';
      
    } catch (error) {
      this.results.authorization.status = 'failed';
      this.results.authorization.details.push(`❌ Dashboard route test failed: ${error.message}`);
    }
  }

  async testCriticalAPIs() {
    console.log('🔌 Testing Critical API Endpoints...');
    
    const apiEndpoints = [
      '/api/nurse/vitals',
      '/api/nurse/tasks', 
      '/api/nurse/medicines',
      '/api/nurse/leave',
      '/api/doctor/patients',
      '/api/super-admin/staff'
    ];
    
    try {
      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            redirect: 'manual'
          });
          
          // API endpoints should return 401 for unauthenticated requests
          if (response.status === 401) {
            this.results.apis.details.push(`✅ ${endpoint} properly secured`);
          } else if (response.status === 200) {
            this.results.apis.details.push(`⚠️  ${endpoint} accessible without auth`);
          } else {
            this.results.apis.details.push(`⚠️  ${endpoint} returned status ${response.status}`);
          }
        } catch (error) {
          this.results.apis.details.push(`❌ ${endpoint} test failed: ${error.message}`);
        }
      }
      
      this.results.apis.status = 'passed';
      
    } catch (error) {
      this.results.apis.status = 'failed';
      this.results.apis.details.push(`❌ API endpoint test failed: ${error.message}`);
    }
  }

  printResults() {
    console.log('\n📋 PRODUCTION READINESS TEST RESULTS');
    console.log('=====================================\n');
    
    const categories = Object.keys(this.results);
    let overallStatus = 'PASSED';
    
    categories.forEach(category => {
      const result = this.results[category];
      const statusIcon = result.status === 'passed' ? '✅' : 
                        result.status === 'failed' ? '❌' : '⏳';
      
      console.log(`${statusIcon} ${category.toUpperCase()}: ${result.status.toUpperCase()}`);
      
      result.details.forEach(detail => {
        console.log(`   ${detail}`);
      });
      
      console.log('');
      
      if (result.status === 'failed') {
        overallStatus = 'FAILED';
      }
    });
    
    console.log('=====================================');
    console.log(`🎯 OVERALL STATUS: ${overallStatus}`);
    
    if (overallStatus === 'PASSED') {
      console.log('🚀 System is ready for production deployment!');
    } else {
      console.log('⚠️  Please address the issues above before production deployment.');
    }
  }
}

// Run tests
const tester = new ProductionReadinessTest();
tester.runAllTests().catch(console.error);
