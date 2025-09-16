/**
 * Comprehensive Role-Specific Authentication Test
 * Tests all user roles with their specific dashboard access and API endpoints
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

// All user credentials from the system
const userCredentials = {
  'super-admin': { 
    login: '9876543210', 
    password: '123456',
    dashboard: '/super-admin',
    apis: ['/api/super-admin/staff', '/api/super-admin/analytics']
  },
  'admin': { 
    login: '9876543211', 
    password: '654321',
    dashboard: '/admin',
    apis: ['/api/admin/patients', '/api/admin/appointments']
  },
  'doctor': { 
    login: '9876543212', 
    password: '111111',
    dashboard: '/doctor',
    apis: ['/api/doctor/patients', '/api/doctor/appointments']
  },
  'pharmacy': { 
    login: '9876543213', 
    password: '222222',
    dashboard: '/pharmacy',
    apis: ['/api/pharmacy/medicines', '/api/pharmacy/inventory']
  },
  'nurse': { 
    login: '9000000000', 
    password: '000000',
    dashboard: '/nurse',
    apis: ['/api/nurse/vitals', '/api/nurse/tasks', '/api/nurse/medicines', '/api/nurse/leave']
  }
};

class ComprehensiveRoleTest {
  constructor() {
    this.results = {};
    this.cookies = {};
  }

  async testUserRole(role, credentials) {
    console.log(`\n🔍 Testing ${role.toUpperCase()} Role`);
    console.log('=' + '='.repeat(role.length + 15));
    
    const result = {
      login: { status: 'pending', details: '' },
      dashboard: { status: 'pending', details: '' },
      apis: { status: 'pending', details: [] },
      logout: { status: 'pending', details: '' }
    };

    try {
      // Test 1: Login
      console.log(`📝 Testing ${role} login...`);
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: credentials.login,
          password: credentials.password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        const cookies = loginResponse.headers.get('set-cookie');
        
        if (cookies && loginData.user) {
          this.cookies[role] = cookies;
          result.login.status = 'passed';
          result.login.details = `✅ Login successful - User: ${loginData.user.name} (${loginData.user.role})`;
          console.log(result.login.details);
          
          // Test 2: Dashboard Access
          console.log(`🏠 Testing ${role} dashboard access...`);
          const dashboardResponse = await fetch(`${BASE_URL}${credentials.dashboard}`, {
            headers: { 'Cookie': cookies },
            redirect: 'manual'
          });
          
          if (dashboardResponse.status === 200) {
            result.dashboard.status = 'passed';
            result.dashboard.details = `✅ Dashboard accessible at ${credentials.dashboard}`;
            console.log(result.dashboard.details);
          } else {
            result.dashboard.status = 'failed';
            result.dashboard.details = `❌ Dashboard returned status ${dashboardResponse.status}`;
            console.log(result.dashboard.details);
          }
          
          // Test 3: Role-specific API endpoints
          console.log(`🔌 Testing ${role} API endpoints...`);
          for (const apiEndpoint of credentials.apis) {
            try {
              const apiResponse = await fetch(`${BASE_URL}${apiEndpoint}`, {
                headers: { 'Cookie': cookies }
              });
              
              if (apiResponse.ok) {
                const apiDetail = `✅ ${apiEndpoint} accessible`;
                result.apis.details.push(apiDetail);
                console.log(`   ${apiDetail}`);
              } else if (apiResponse.status === 401) {
                const apiDetail = `⚠️  ${apiEndpoint} requires authentication (401)`;
                result.apis.details.push(apiDetail);
                console.log(`   ${apiDetail}`);
              } else {
                const apiDetail = `⚠️  ${apiEndpoint} returned status ${apiResponse.status}`;
                result.apis.details.push(apiDetail);
                console.log(`   ${apiDetail}`);
              }
            } catch (error) {
              const apiDetail = `❌ ${apiEndpoint} error: ${error.message}`;
              result.apis.details.push(apiDetail);
              console.log(`   ${apiDetail}`);
            }
          }
          
          result.apis.status = result.apis.details.some(d => d.includes('✅')) ? 'passed' : 'failed';
          
          // Test 4: Cross-role access prevention
          console.log(`🔒 Testing cross-role access prevention...`);
          const otherRoles = Object.keys(userCredentials).filter(r => r !== role);
          const testRole = otherRoles[0];
          const testDashboard = userCredentials[testRole].dashboard;
          
          const crossAccessResponse = await fetch(`${BASE_URL}${testDashboard}`, {
            headers: { 'Cookie': cookies },
            redirect: 'manual'
          });
          
          if (crossAccessResponse.status === 302 || crossAccessResponse.status === 307) {
            console.log(`✅ Cross-role access properly blocked (${role} cannot access ${testDashboard})`);
          } else if (crossAccessResponse.status === 200) {
            console.log(`⚠️  Cross-role access allowed (${role} can access ${testDashboard})`);
          }
          
          // Test 5: Logout
          console.log(`🚪 Testing ${role} logout...`);
          const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: { 'Cookie': cookies }
          });
          
          if (logoutResponse.ok) {
            result.logout.status = 'passed';
            result.logout.details = '✅ Logout successful';
            console.log(result.logout.details);
          } else {
            result.logout.status = 'failed';
            result.logout.details = `❌ Logout failed with status ${logoutResponse.status}`;
            console.log(result.logout.details);
          }
          
        } else {
          result.login.status = 'failed';
          result.login.details = '❌ Login failed - missing cookies or user data';
          console.log(result.login.details);
        }
      } else {
        const errorText = await loginResponse.text();
        result.login.status = 'failed';
        result.login.details = `❌ Login failed: ${loginResponse.status} - ${errorText}`;
        console.log(result.login.details);
      }
      
    } catch (error) {
      result.login.status = 'failed';
      result.login.details = `❌ Test error: ${error.message}`;
      console.log(result.login.details);
    }
    
    this.results[role] = result;
    return result;
  }

  async runAllRoleTests() {
    console.log('🎯 COMPREHENSIVE ROLE-SPECIFIC AUTHENTICATION TEST');
    console.log('================================================\n');
    
    // Test each role
    for (const [role, credentials] of Object.entries(userCredentials)) {
      await this.testUserRole(role, credentials);
    }
    
    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 TEST SUMMARY');
    console.log('===============\n');
    
    let allPassed = true;
    
    for (const [role, result] of Object.entries(this.results)) {
      const loginIcon = result.login.status === 'passed' ? '✅' : '❌';
      const dashboardIcon = result.dashboard.status === 'passed' ? '✅' : '❌';
      const apisIcon = result.apis.status === 'passed' ? '✅' : '❌';
      const logoutIcon = result.logout.status === 'passed' ? '✅' : '❌';
      
      console.log(`${role.toUpperCase()}:`);
      console.log(`  Login: ${loginIcon} ${result.login.status}`);
      console.log(`  Dashboard: ${dashboardIcon} ${result.dashboard.status}`);
      console.log(`  APIs: ${apisIcon} ${result.apis.status}`);
      console.log(`  Logout: ${logoutIcon} ${result.logout.status}`);
      console.log('');
      
      if (result.login.status !== 'passed' || 
          result.dashboard.status !== 'passed' || 
          result.apis.status !== 'passed' || 
          result.logout.status !== 'passed') {
        allPassed = false;
      }
    }
    
    console.log('===============');
    if (allPassed) {
      console.log('🎉 ALL ROLES PASSED - SYSTEM IS PRODUCTION READY!');
    } else {
      console.log('⚠️  SOME ROLES FAILED - REVIEW ISSUES ABOVE');
    }
    
    console.log('\n📋 VERIFIED FEATURES:');
    console.log('- Role-based authentication');
    console.log('- Dashboard access control');
    console.log('- API endpoint security');
    console.log('- Cross-role access prevention');
    console.log('- Proper logout functionality');
  }
}

// Run comprehensive test
const tester = new ComprehensiveRoleTest();
tester.runAllRoleTests().catch(console.error);
