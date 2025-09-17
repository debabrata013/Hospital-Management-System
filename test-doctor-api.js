const fetch = require('node-fetch');

async function testDoctorAPI() {
  try {
    console.log('Testing doctor API endpoint...');
    
    // First, let's check what doctors exist in the database
    const response = await fetch('http://localhost:3001/api/admin/doctors');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Available doctors:', JSON.stringify(data, null, 2));
    
    // If doctors exist, test the details endpoint with the first doctor
    if (data.doctors && data.doctors.length > 0) {
      const firstDoctorId = data.doctors[0].id;
      console.log(`\nTesting doctor details for ID: ${firstDoctorId}`);
      
      const detailsResponse = await fetch(`http://localhost:3001/api/admin/doctor-details/${firstDoctorId}`);
      
      if (!detailsResponse.ok) {
        console.error(`Doctor details API error: ${detailsResponse.status} ${detailsResponse.statusText}`);
        const errorText = await detailsResponse.text();
        console.error('Error response:', errorText);
      } else {
        const detailsData = await detailsResponse.json();
        console.log('Doctor details:', JSON.stringify(detailsData, null, 2));
      }
    } else {
      console.log('No doctors found in the database');
    }
    
  } catch (error) {
    console.error('Error testing doctor API:', error);
  }
}

testDoctorAPI();