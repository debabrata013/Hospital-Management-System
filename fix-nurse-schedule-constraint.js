// Fix the unique constraint to allow double shifts
const mysql = require('mysql2/promise');

async function fixScheduleConstraint() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'u153229971_Hospital',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔍 Checking current constraints on nurse_schedules table...\n');

    // Check current indexes/constraints
    const [constraints] = await connection.execute(`
      SHOW INDEX FROM nurse_schedules
    `);

    console.log('📋 Current indexes:');
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.Key_name}: ${constraint.Column_name} (Non_unique: ${constraint.Non_unique})`);
    });

    // Check if unique_nurse_shift exists
    const uniqueConstraint = constraints.find(c => c.Key_name === 'unique_nurse_shift');
    
    if (uniqueConstraint) {
      console.log('\n❌ Found problematic unique_nurse_shift constraint');
      console.log('🔧 Dropping the constraint to allow double shifts...');
      
      // Drop the existing constraint
      await connection.execute(`
        ALTER TABLE nurse_schedules 
        DROP INDEX unique_nurse_shift
      `);
      
      console.log('✅ Dropped unique_nurse_shift constraint');
      
      // Create a new constraint that allows multiple shifts but prevents exact duplicates
      console.log('🔧 Creating new constraint to prevent exact duplicates only...');
      
      await connection.execute(`
        ALTER TABLE nurse_schedules 
        ADD CONSTRAINT unique_nurse_schedule 
        UNIQUE (nurse_id, shift_date, shift_type, start_time, end_time)
      `);
      
      console.log('✅ Created new unique_nurse_schedule constraint');
      console.log('   This allows: Multiple shifts per day for same nurse');
      console.log('   This prevents: Exact duplicate schedules');
      
    } else {
      console.log('\n✅ unique_nurse_shift constraint not found - might already be fixed');
    }

    // Show final constraints
    console.log('\n📋 Final indexes:');
    const [finalConstraints] = await connection.execute(`
      SHOW INDEX FROM nurse_schedules
    `);

    finalConstraints.forEach(constraint => {
      console.log(`   - ${constraint.Key_name}: ${constraint.Column_name} (Non_unique: ${constraint.Non_unique})`);
    });

    console.log('\n🎉 Database constraint fixed!');
    console.log('\n✅ Now you can:');
    console.log('   - Create Morning + Evening shifts for same nurse');
    console.log('   - Create Evening + Night shifts for same nurse');
    console.log('   - Create any non-overlapping double shifts');
    console.log('\n❌ Still prevented:');
    console.log('   - Exact duplicate schedules (same nurse, date, shift type, and times)');

  } catch (error) {
    console.error('❌ Error fixing constraint:', error.message);
    
    if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('\n💡 The constraint might already be dropped or have a different name');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔐 Database connection failed. Check your credentials.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

fixScheduleConstraint();
