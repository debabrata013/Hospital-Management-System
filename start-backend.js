#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 Hospital Management System - Backend Setup');
console.log('=============================================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if package.json exists
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.error('❌ package.json not found in current directory');
  process.exit(1);
}

// Install additional backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  const backendPackagePath = path.join(__dirname, 'backend-package.json');
  if (fs.existsSync(backendPackagePath)) {
    const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
    
    // Install each dependency
    for (const [dep, version] of Object.entries(backendPackage.dependencies)) {
      try {
        console.log(`Installing ${dep}@${version}...`);
        execSync(`npm install ${dep}@${version}`, { stdio: 'inherit' });
      } catch (error) {
        console.log(`⚠️  ${dep} might already be installed or failed to install`);
      }
    }
  }
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
}

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating .env file...');
  const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hospital-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@hospital.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
  console.log('⚠️  Please update the .env file with your actual configuration values');
} else {
  console.log('✅ .env file already exists');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
} else {
  console.log('✅ Uploads directory already exists');
}

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Logs directory created');
} else {
  console.log('✅ Logs directory already exists');
}

console.log('\n🎉 Backend setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Update the .env file with your actual configuration');
console.log('2. Ensure MongoDB is running');
console.log('3. Start the backend server:');
console.log('   npm run dev (for development)');
console.log('   node server.js (for production)');
console.log('\n🔗 Server will be available at: http://localhost:5000');
console.log('📊 Health check: http://localhost:5000/health');
console.log('📚 API documentation: Check BACKEND_README.md');

// Ask if user wants to start the server
console.log('\n🚀 Would you like to start the server now? (y/n)');
process.stdin.once('data', (data) => {
  const answer = data.toString().trim().toLowerCase();
  if (answer === 'y' || answer === 'yes') {
    console.log('\n🚀 Starting backend server...');
    try {
      execSync('node server.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Error starting server:', error.message);
    }
  } else {
    console.log('\n👋 Setup complete! Start the server when ready.');
    process.exit(0);
  }
});
