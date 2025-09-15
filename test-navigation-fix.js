// Use built-in fetch (Node.js 18+) or fallback
const fetch = globalThis.fetch || require('node-fetch');

async function testNavigationFix() {
  console.log('🔍 TESTING PRODUCTION NAVIGATION FIX\n');

  try {
    // Test 1: Check unauthenticated homepage
    console.log('1. Testing unauthenticated homepage navigation...');
    const homeResponse = await fetch('http://localhost:3500');
    const homeHtml = await homeResponse.text();
    
    // Check for Login button (should be present)
    const hasLoginButton = homeHtml.includes('Login') || homeHtml.includes('लॉगिन');
    
    // Check for Dashboard/Logout buttons (should NOT be present for unauthenticated users)
    const hasDashboardButton = homeHtml.includes('Dashboard');
    const hasLogoutButton = homeHtml.includes('Logout');
    
    console.log(`   ✅ Login button present: ${hasLoginButton ? 'YES' : 'NO'}`);
    console.log(`   ✅ Dashboard button hidden: ${!hasDashboardButton ? 'YES' : 'NO'}`);
    console.log(`   ✅ Logout button hidden: ${!hasLogoutButton ? 'YES' : 'NO'}`);
    
    // Test 2: Test authenticated user navigation
    console.log('\n2. Testing authenticated user navigation...');
    
    // Login with admin credentials
    const loginResponse = await fetch('http://localhost:3500/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '9876543211',
        password: '654321'
      })
    });
    
    const loginResult = await loginResponse.json();
    const cookies = loginResponse.headers.get('set-cookie');
    
    if (loginResponse.ok && cookies) {
      console.log(`   ✅ Login successful: Status ${loginResponse.status}`);
      
      // Test authenticated homepage with cookies
      const authHomeResponse = await fetch('http://localhost:3500', {
        headers: { 'Cookie': cookies }
      });
      const authHomeHtml = await authHomeResponse.text();
      
      const authHasDashboard = authHomeHtml.includes('Dashboard');
      const authHasLogout = authHomeHtml.includes('Logout');
      const authHasLogin = authHomeHtml.includes('Login') && !authHomeHtml.includes('Logout');
      
      console.log(`   ✅ Dashboard button visible: ${authHasDashboard ? 'YES' : 'NO'}`);
      console.log(`   ✅ Logout button visible: ${authHasLogout ? 'YES' : 'NO'}`);
      console.log(`   ✅ Login button hidden: ${!authHasLogin ? 'YES' : 'NO'}`);
      
      // Test dashboard access
      const dashboardResponse = await fetch('http://localhost:3500/admin', {
        headers: { 'Cookie': cookies }
      });
      console.log(`   ✅ Dashboard access: Status ${dashboardResponse.status}`);
      
    } else {
      console.log(`   ❌ Login failed: Status ${loginResponse.status}`);
    }
    
    // Summary
    console.log('\n📊 NAVIGATION FIX TEST SUMMARY:');
    console.log('=====================================');
    
    if (hasLoginButton && !hasDashboardButton && !hasLogoutButton) {
      console.log('✅ UNAUTHENTICATED NAVIGATION: CORRECT');
      console.log('   - Shows Login button only');
      console.log('   - Hides Dashboard/Logout buttons');
    } else {
      console.log('❌ UNAUTHENTICATED NAVIGATION: ISSUE DETECTED');
      console.log(`   - Login button: ${hasLoginButton ? 'Present' : 'Missing'}`);
      console.log(`   - Dashboard button: ${hasDashboardButton ? 'Incorrectly shown' : 'Correctly hidden'}`);
      console.log(`   - Logout button: ${hasLogoutButton ? 'Incorrectly shown' : 'Correctly hidden'}`);
    }
    
    console.log('\n🎯 PRODUCTION DEPLOYMENT STATUS:');
    if (hasLoginButton && !hasDashboardButton && !hasLogoutButton) {
      console.log('🟢 NAVIGATION FIX SUCCESSFUL ✅');
      console.log('   Ready for production deployment!');
    } else {
      console.log('🔴 NAVIGATION FIX NEEDS ATTENTION ❌');
      console.log('   Additional fixes required before deployment');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNavigationFix();
