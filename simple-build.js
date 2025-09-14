// simple-build.js
// A simplified build script that properly sets environment variables
const { execSync } = require('child_process');

console.log('Starting simplified build process...');

// Set environment variables for the build
process.env.NEXT_STATIC_BUILD = 'true';
process.env.STATIC_BUILD = 'true';
process.env.NODE_ENV = 'production';

try {
  // Run the build
  console.log('Running Next.js build...');
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_STATIC_BUILD: 'true',
      STATIC_BUILD: 'true',
      NODE_ENV: 'production'
    }
  });
  
  console.log('\nBuild completed successfully!');
  console.log('\nDeployment Instructions:');
  console.log('------------------------');
  console.log('1. Upload the following folders to your server:');
  console.log('   - .next/standalone/');
  console.log('   - .next/static/ → to .next/standalone/.next/static/');
  console.log('   - public/ → to .next/standalone/public/');
  console.log('2. Run "node server.js" in the standalone directory');
  
} catch (error) {
  console.error('\nBuild failed:', error);
  process.exit(1);
}