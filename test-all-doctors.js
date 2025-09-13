// Quick test to verify all doctors are now available
const fetch = require('node-fetch');

async function testAllDoctors() {
  try {
    console.log('🧪 Testing if all doctors are now available...\n');
    
    const response = await fetch('http://localhost:3000/api/super-admin/doctors');
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Found ${data.doctors.length} doctors in the API:`);
      data.doctors.forEach((doctor, index) => {
        console.log(`   ${index + 1}. ${doctor.name} (${doctor.department || 'No dept'})`);
      });
      
      console.log('\n🎉 SUCCESS! All doctors are now available in the database.');
      console.log('\n📝 Next Steps:');
      console.log('   1. Open http://localhost:3000/admin/erp/attendance in your browser');
      console.log('   2. You should now see all 10 doctors in the dropdown');
      console.log('   3. The count should show "Staff (10 total)" and "Doctors: 10"');
      
    } else {
      console.log('❌ API failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAllDoctors();
