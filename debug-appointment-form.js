// Debug script to test appointment form APIs
const fetch = globalThis.fetch || require('node-fetch');

async function debugAppointmentForm() {
  console.log('🔍 DEBUGGING APPOINTMENT FORM APIS\n');

  try {
    // Test patients API
    console.log('1. Testing patients API...');
    const patientsResponse = await fetch('http://localhost:3000/api/receptionist/patients');
    const patientsData = await patientsResponse.json();
    
    console.log(`   📊 Patients API: Status ${patientsResponse.status}`);
    console.log(`   📋 Patients count: ${patientsData.patients?.length || 0}`);
    
    if (patientsData.patients?.length > 0) {
      console.log(`   👤 Sample patient:`, patientsData.patients[0]);
    }
    
    // Test patient search API
    console.log('\n2. Testing patient search API...');
    const searchResponse = await fetch('http://localhost:3000/api/receptionist/patients/search?q=amit');
    const searchData = await searchResponse.json();
    
    console.log(`   📊 Search API: Status ${searchResponse.status}`);
    console.log(`   🔍 Search results: ${searchData.patients?.length || 0}`);
    
    // Test doctors API
    console.log('\n3. Testing doctors API...');
    const doctorsResponse = await fetch('http://localhost:3000/api/receptionist/doctors');
    const doctorsData = await doctorsResponse.json();
    
    console.log(`   📊 Doctors API: Status ${doctorsResponse.status}`);
    console.log(`   👨‍⚕️ Doctors count: ${doctorsData.doctors?.length || 0}`);
    
    if (doctorsData.doctors?.length > 0) {
      console.log(`   🩺 Sample doctor:`, doctorsData.doctors[0]);
    }
    
    // Test appointments API
    console.log('\n4. Testing appointments API...');
    const appointmentsResponse = await fetch('http://localhost:3000/api/receptionist/appointments');
    const appointmentsData = await appointmentsResponse.json();
    
    console.log(`   📊 Appointments API: Status ${appointmentsResponse.status}`);
    console.log(`   📅 Appointments count: ${appointmentsData.appointments?.length || 0}`);
    
    console.log('\n📊 APPOINTMENT FORM DEBUG SUMMARY:');
    console.log('=====================================');
    
    if (patientsResponse.status === 200 && patientsData.patients?.length > 0) {
      console.log('✅ Patients API working - data available');
    } else {
      console.log('❌ Patients API issue - no data or error');
    }
    
    if (doctorsResponse.status === 200 && doctorsData.doctors?.length > 0) {
      console.log('✅ Doctors API working - data available');
    } else {
      console.log('❌ Doctors API issue - no data or error');
    }
    
    if (searchResponse.status === 200) {
      console.log('✅ Patient search API working');
    } else {
      console.log('❌ Patient search API issue');
    }
    
    console.log('\n🎯 LIKELY ISSUES:');
    if (patientsData.patients?.length === 0) {
      console.log('- No patients in database - form will show empty patient list');
    }
    if (doctorsData.doctors?.length === 0) {
      console.log('- No doctors in database - form will show empty doctor dropdown');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAppointmentForm();
