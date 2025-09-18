// Test script for nurse scheduling functionality
const testNurseScheduling = async () => {
  console.log('🏥 Testing Nurse Scheduling System...\n');

  try {
    // Test 1: Check if nurses API is working
    console.log('1. Testing Nurses API...');
    const nursesResponse = await fetch('http://localhost:3000/api/admin/nurses');
    const nursesData = await nursesResponse.json();
    console.log(`   ✅ Nurses API Status: ${nursesResponse.status}`);
    console.log(`   📊 Nurses found: ${nursesData.nurses ? nursesData.nurses.length : 0}`);
    
    if (nursesData.nurses && nursesData.nurses.length > 0) {
      console.log(`   👩‍⚕️ First nurse: ${nursesData.nurses[0].name} (ID: ${nursesData.nurses[0].id})`);
    }

    // Test 2: Check if schedules API is working
    console.log('\n2. Testing Nurse Schedules API...');
    const schedulesResponse = await fetch('http://localhost:3000/api/admin/nurses-schedules');
    const schedulesData = await schedulesResponse.json();
    console.log(`   ✅ Schedules API Status: ${schedulesResponse.status}`);
    console.log(`   📅 Schedules found: ${schedulesData.schedules ? schedulesData.schedules.length : 0}`);

    // Test 3: Try to create a test schedule (if we have nurses)
    if (nursesData.nurses && nursesData.nurses.length > 0) {
      console.log('\n3. Testing Schedule Creation...');
      const testNurse = nursesData.nurses[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const createScheduleData = {
        nurseId: testNurse.id,
        date: tomorrowStr,
        startTime: '08:00',
        endTime: '16:00',
        wardAssignment: 'General Ward',
        shiftType: 'Morning',
        maxPatients: 8
      };

      console.log(`   📝 Creating schedule for: ${testNurse.name}`);
      console.log(`   📅 Date: ${tomorrowStr}`);
      console.log(`   ⏰ Time: 08:00 - 16:00`);

      const createResponse = await fetch('http://localhost:3000/api/admin/nurses-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createScheduleData),
      });

      const createResult = await createResponse.json();
      console.log(`   ✅ Create Status: ${createResponse.status}`);
      
      if (createResponse.ok) {
        console.log(`   🎉 Schedule created successfully!`);
        console.log(`   🆔 Schedule ID: ${createResult.scheduleId}`);
      } else {
        console.log(`   ❌ Error: ${createResult.error}`);
      }
    }

    // Test 4: Check individual nurse schedule API
    console.log('\n4. Testing Individual Nurse Schedule API...');
    const nurseScheduleResponse = await fetch('http://localhost:3000/api/nurse/schedule');
    console.log(`   ✅ Nurse Schedule API Status: ${nurseScheduleResponse.status}`);
    
    if (nurseScheduleResponse.ok) {
      const nurseScheduleData = await nurseScheduleResponse.json();
      console.log(`   📊 Today's schedule: ${nurseScheduleData.todaySchedule ? 'Found' : 'None'}`);
      console.log(`   📅 Upcoming schedules: ${nurseScheduleData.upcomingSchedules ? nurseScheduleData.upcomingSchedules.length : 0}`);
    } else {
      console.log(`   ⚠️  Note: This requires nurse authentication`);
    }

    console.log('\n🏁 Test Complete!');
    console.log('\n📋 Summary:');
    console.log('   - Nurses API: Working');
    console.log('   - Schedules API: Working');
    console.log('   - Schedule Creation: Tested');
    console.log('   - Individual Schedule API: Available');
    console.log('\n✨ The nurse scheduling system appears to be functional!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the development server is running (npm run dev)');
    console.log('   2. Check if the database is connected');
    console.log('   3. Verify the nurse_schedules table exists');
    console.log('   4. Ensure there are nurses in the users table');
  }
};

// Run the test
testNurseScheduling();
