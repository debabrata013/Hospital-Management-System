// Test the fixed schedule creation API
const testScheduleAPI = async () => {
  try {
    console.log('Testing schedule creation API...');
    
    const testData = {
      doctorId: 7, // Using doctor ID from database
      date: '2025-09-17', // Tomorrow
      startTime: '09:00',
      endTime: '17:00',
      roomNumber: 'OPD',
      maxPatients: 12
    };
    
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/admin/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Schedule creation test PASSED');
    } else {
      console.log('❌ Schedule creation test FAILED');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the test if we can access fetch (in browser/node with fetch)
if (typeof fetch !== 'undefined') {
  testScheduleAPI();
} else {
  console.log('This test needs to be run in a browser or Node.js environment with fetch support');
}