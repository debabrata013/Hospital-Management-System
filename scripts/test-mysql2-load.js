console.log('Attempting to load mysql2...');
try {
  const mysql = require('mysql2/promise');
  console.log('✅ mysql2 loaded successfully.');
  console.log(mysql);
} catch (e) {
  console.error('❌ Failed to load mysql2:', e);
}
