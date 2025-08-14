import dotenv from 'dotenv';

console.log('[DEBUG] Starting debug-env.js');

dotenv.config();

console.log('[DEBUG] .env file loaded (if it exists).');
console.log('--- Environment Variables ---');
console.log(`DB_NAME: ${process.env.DB_NAME}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD}`);
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log('---------------------------');
console.log('[DEBUG] Script finished.');
