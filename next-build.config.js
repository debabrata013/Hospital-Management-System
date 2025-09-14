// next-build.config.js
// This file contains configurations for the Next.js build process

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean the .next directory if it exists
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  try {
    console.log('Cleaning .next directory...');
    if (process.platform === 'win32') {
      execSync('rmdir /s /q .next', { stdio: 'inherit' });
    } else {
      execSync('rm -rf .next', { stdio: 'inherit' });
    }
  } catch (e) {
    console.warn('Warning: Could not clean .next directory:', e.message);
  }
}

// Set environment variables for the build process
process.env.NEXT_STATIC_BUILD = 'true';
process.env.STATIC_BUILD = 'true';
process.env.NEXT_PHASE = 'phase-production-build';
process.env.NODE_ENV = 'production';

// Log the environment variables
console.log('Building Next.js application with dynamic API support...');

// Run the Next.js build with dynamic API support
try {
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_STATIC_BUILD: 'true',
      STATIC_BUILD: 'true',
      NEXT_PHASE: 'phase-production-build',
      NODE_ENV: 'production'
    }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}