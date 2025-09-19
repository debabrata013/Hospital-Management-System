const mysql = require('mysql2/promise');

async function debugNurseSchedule() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔍 Debugging nurse schedule table...\n');

    // 1. Check table structure
    console.log('📋 Table structure:');
    const [columns] = await connection.execute('DESCRIBE nurse_schedules');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });

    // 2. Check current schedules
    console.log('\n📅 Current schedules:');
    const [schedules] = await connection.execute(`
      SELECT 
        ns.id, 
        ns.nurse_id, 
        u.name as nurse_name,
        ns.shift_date, 
        ns.start_time, 
        ns.end_time, 
        ns.shift_type,
        ns.department,
        ns.status
      FROM nurse_schedules ns
      LEFT JOIN users u ON ns.nurse_id = u.id
      ORDER BY ns.shift_date DESC, ns.start_time ASC
      LIMIT 10
    `);

    if (schedules.length === 0) {
      console.log('  No schedules found');
    } else {
      schedules.forEach(schedule => {
        console.log(`  ID: ${schedule.id} | Nurse: ${schedule.nurse_name} (${schedule.nurse_id}) | Date: ${schedule.shift_date} | Time: ${schedule.start_time}-${schedule.end_time} | Type: ${schedule.shift_type} | Dept: ${schedule.department} | Status: ${schedule.status}`);
      });
    }

    // 3. Check specific nurse (shivam - ID 58)
    console.log('\n👤 Checking nurse ID 58 (shivam):');
    const [shivamSchedules] = await connection.execute(`
      SELECT 
        id, shift_date, start_time, end_time, shift_type, department, status
      FROM nurse_schedules 
      WHERE nurse_id = 58
      ORDER BY shift_date DESC
    `);

    if (shivamSchedules.length === 0) {
      console.log('  No schedules found for nurse ID 58');
    } else {
      shivamSchedules.forEach(schedule => {
        console.log(`  Schedule ID: ${schedule.id} | Date: ${schedule.shift_date} | Time: ${schedule.start_time}-${schedule.end_time} | Type: ${schedule.shift_type} | Dept: ${schedule.department} | Status: ${schedule.status}`);
      });
    }

    // 4. Test current time validation
    console.log('\n⏰ Testing current time validation:');
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];
    
    console.log(`  Current date: ${currentDate}`);
    console.log(`  Current time: ${currentTime}`);

    const [activeSchedules] = await connection.execute(`
      SELECT 
        id, nurse_id, shift_date, start_time, end_time, shift_type, 
        department as ward_assignment, status
      FROM nurse_schedules 
      WHERE nurse_id = 58 
        AND shift_date = ? 
        AND status IN ('scheduled', 'active', 'Scheduled', 'Active')
        AND start_time <= ? 
        AND end_time >= ?
    `, [currentDate, currentTime, currentTime]);

    console.log(`  Active schedules for nurse 58: ${activeSchedules.length}`);
    if (activeSchedules.length > 0) {
      activeSchedules.forEach(schedule => {
        console.log(`    ✅ Active: ${schedule.shift_type} ${schedule.start_time}-${schedule.end_time} (${schedule.status})`);
      });
    }

    await connection.end();
    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugNurseSchedule();
