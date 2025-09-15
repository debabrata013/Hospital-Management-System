/**
 * Dashboard Error Analysis and Fix
 * Identifies and resolves 500 errors on dashboard pages
 */

const fs = require('fs');
const path = require('path');

function analyzeDashboardErrors() {
  console.log('🔧 DASHBOARD ERROR ANALYSIS');
  console.log('===========================\n');

  const dashboardPaths = [
    'app/admin/page.tsx',
    'app/super-admin/page.tsx',
    'app/doctor/page.tsx',
    'app/staff/page.tsx',
    'app/receptionist/page.tsx'
  ];

  console.log('📋 Common causes of dashboard 500 errors:');
  console.log('1. Missing UI components or imports');
  console.log('2. Client-side code running on server');
  console.log('3. Missing environment variables');
  console.log('4. Database connection issues in components');
  console.log('5. Missing dependencies\n');

  // Check for common issues
  dashboardPaths.forEach(dashboardPath => {
    const fullPath = path.join(__dirname, dashboardPath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${dashboardPath} exists`);
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for "use client" directive
      const hasUseClient = content.includes('"use client"') || content.includes("'use client'");
      console.log(`   Client directive: ${hasUseClient ? '✅' : '❌'}`);
      
      // Check for potential server-side issues
      const hasUseEffect = content.includes('useEffect');
      const hasUseState = content.includes('useState');
      const hasUseRouter = content.includes('useRouter');
      
      if ((hasUseEffect || hasUseState || hasUseRouter) && !hasUseClient) {
        console.log(`   ⚠️ Client hooks without "use client" directive`);
      }
    } else {
      console.log(`❌ ${dashboardPath} not found`);
    }
  });

  console.log('\n🔧 RECOMMENDED FIXES:');
  console.log('1. Ensure all dashboard pages have "use client" directive');
  console.log('2. Check server logs for specific error details');
  console.log('3. Verify all imported components exist');
  console.log('4. Test with minimal dashboard content first');
}

function createMinimalDashboard() {
  console.log('\n🛠️ Creating minimal test dashboard...');
  
  const minimalAdminDashboard = `"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return <div className="p-8">Redirecting to login...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-green-100 p-4 rounded">
        <p>✅ Authentication Working!</p>
        <p>Welcome, {user.name || user.email}</p>
        <p>Role: {user.role}</p>
      </div>
    </div>
  )
}`;

  const backupPath = path.join(__dirname, 'app/admin/page.backup.tsx');
  const currentPath = path.join(__dirname, 'app/admin/page.tsx');
  
  try {
    // Backup current file
    if (fs.existsSync(currentPath)) {
      fs.copyFileSync(currentPath, backupPath);
      console.log('✅ Current admin dashboard backed up');
    }
    
    // Create minimal dashboard
    fs.writeFileSync(currentPath, minimalAdminDashboard);
    console.log('✅ Minimal admin dashboard created');
    console.log('   This should resolve 500 errors and confirm auth is working');
    
  } catch (error) {
    console.log('❌ Could not create minimal dashboard:', error.message);
  }
}

// Run analysis
analyzeDashboardErrors();

// Offer to create minimal dashboard
console.log('\n❓ Would you like to create a minimal dashboard to test authentication?');
console.log('   This will backup your current dashboard and create a simple test version.');
console.log('   Run: node fix-dashboard-errors.js --create-minimal');

if (process.argv.includes('--create-minimal')) {
  createMinimalDashboard();
}
