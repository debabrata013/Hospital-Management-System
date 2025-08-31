const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function testPatientCreation() {
  let connection;
  try {
    console.log('🧪 Testing Patient Creation API...\n');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully');

    // Test data matching the frontend form
    const testPatientData = {
      name: "John Doe",
      age: 35,
      gender: "Male",
      contactNumber: "+1234567890",
      emergencyContact: "+0987654321",
      address: "123 Main St, Anytown, USA",
      diagnosis: "Hypertension",
      admissionDate: "2024-01-15",
      expectedDischargeDate: "2024-01-20",
      doctorName: "Dr. Smith",
      department: "Cardiology",
      insuranceProvider: "Blue Cross",
      insuranceNumber: "BC123456",
      roomId: "101"
    };

    console.log('📝 Test Patient Data:', testPatientData);

    // Test the API endpoint
    console.log('\n🌐 Testing POST /api/admin/patients...');
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPatientData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('   ✅ Patient Creation Success:', result);
        
        // Verify the patient was created in database
        console.log('\n🔍 Verifying patient in database...');
        const [patientResult] = await connection.execute(`
          SELECT * FROM patients WHERE name = ? ORDER BY id DESC LIMIT 1
        `, [testPatientData.name]);
        
        if (patientResult.length > 0) {
          const patient = patientResult[0];
          console.log('   ✅ Patient found in database:', {
            id: patient.id,
            patient_id: patient.patient_id,
            name: patient.name,
            gender: patient.gender,
            contact_number: patient.contact_number
          });
          
          // Check if admission was created
          const [admissionResult] = await connection.execute(`
            SELECT * FROM Admissions WHERE patientId = ? ORDER BY createdAt DESC LIMIT 1
          `, [patient.id]);
          
          if (admissionResult.length > 0) {
            const admission = admissionResult[0];
            console.log('   ✅ Admission record created:', {
              id: admission.id,
              patientId: admission.patientId,
              diagnosis: admission.diagnosis,
              status: admission.status,
              ward: admission.ward
            });
          } else {
            console.log('   ⚠️  No admission record found');
          }
        } else {
          console.log('   ❌ Patient not found in database');
        }
        
      } else {
        const errorText = await response.text();
        console.log('   ❌ Patient Creation Failed:', response.status, errorText);
      }
      
    } catch (error) {
      console.log('   ❌ API Call Error:', error.message);
    }

    console.log('\n🎉 Patient Creation Testing Completed!');
    
  } catch (error) {
    console.error('\n❌ Patient creation testing failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testPatientCreation().catch(console.error);
