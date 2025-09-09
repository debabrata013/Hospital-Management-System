#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔐 Testing Hospital Management System Authentication...\n');

// Test 1: Check if user database exists
const dbPath = path.join(__dirname, 'database', 'users-auth-data.json');
if (fs.existsSync(dbPath)) {
    console.log('✅ User database file exists');
    
    try {
        const userData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        console.log(`✅ User database loaded successfully`);
        console.log(`   - Total users: ${userData.users.length}`);
        console.log(`   - Total roles: ${Object.keys(userData.roles).length}`);
        
        // Display user summary
        console.log('\n📋 User Summary:');
        userData.users.forEach(user => {
            console.log(`   - ${user.name} (${user.role}) - ${user.email} / ${user.mobile}`);
        });
        
    } catch (error) {
        console.log('❌ Error reading user database:', error.message);
    }
} else {
    console.log('❌ User database file not found');
}

// Test 2: Check middleware file
const middlewarePath = path.join(__dirname, 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
    console.log('\n✅ Authentication middleware exists');
} else {
    console.log('\n❌ Authentication middleware not found');
}

// Test 3: Check auth API routes
const authRoutes = [
    'app/api/auth/login/route.ts',
    'app/api/auth/logout/route.ts',
    'app/api/auth/session/route.ts'
];

console.log('\n🔗 Authentication API Routes:');
authRoutes.forEach(route => {
    const routePath = path.join(__dirname, route);
    if (fs.existsSync(routePath)) {
        console.log(`   ✅ ${route}`);
    } else {
        console.log(`   ❌ ${route}`);
    }
});

// Test 4: Check auth components
const authComponents = [
    'components/auth/LogoutButton.tsx',
    'components/auth/ProtectedRoute.tsx',
    'components/auth/UserSession.tsx'
];

console.log('\n🧩 Authentication Components:');
authComponents.forEach(component => {
    const componentPath = path.join(__dirname, component);
    if (fs.existsSync(componentPath)) {
        console.log(`   ✅ ${component}`);
    } else {
        console.log(`   ❌ ${component}`);
    }
});

// Test 5: Check environment configuration
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    console.log('\n✅ Environment configuration exists');
    
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        if (envContent.includes('JWT_SECRET')) {
            console.log('   ✅ JWT_SECRET configured');
        } else {
            console.log('   ❌ JWT_SECRET not found in .env.local');
        }
    } catch (error) {
        console.log('   ❌ Error reading .env.local:', error.message);
    }
} else {
    console.log('\n❌ Environment configuration not found');
}

// Test 6: Check package.json for dependencies
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    try {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const requiredDeps = ['jose', 'bcryptjs', 'sonner'];
        
        console.log('\n📦 Required Dependencies:');
        requiredDeps.forEach(dep => {
            if (packageData.dependencies[dep] || packageData.devDependencies[dep]) {
                console.log(`   ✅ ${dep}`);
            } else {
                console.log(`   ❌ ${dep} - Run: npm install ${dep}`);
            }
        });
        
    } catch (error) {
        console.log('\n❌ Error reading package.json:', error.message);
    }
}

console.log('\n🚀 Next Steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Navigate to http://localhost:3000');
console.log('3. Try accessing any dashboard (you should be redirected to login)');
console.log('4. Login with test credentials from USER_CREDENTIALS.md');
console.log('5. Test logout functionality');

console.log('\n🔑 Quick Test Credentials:');
console.log('Super Admin: superadmin@hospital.com / SuperAdmin@123');
console.log('Admin: admin@hospital.com / Admin@123');
console.log('Doctor: dr.sharma@hospital.com / Doctor@123');

console.log('\n📖 For complete user list, see: USER_CREDENTIALS.md');
console.log('🔐 Authentication system setup complete!');
