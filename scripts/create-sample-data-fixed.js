// Create sample data for testing (Fixed version)
// Hospital Management System - NMSC

const { executeQuery } = require('../lib/mysql-connection.js');
const bcrypt = require('bcryptjs');

async function createSampleData() {
  try {
    console.log('Creating sample data for testing...');

    // 1. Create sample patients if none exist
    const patientsCheck = await executeQuery('SELECT id FROM patients LIMIT 1');
    
    if (patientsCheck.length === 0) {
      console.log('Creating sample patients...');
      
      const patients = [
        {
          patient_id: 'PAT001',
          name: 'Amit Sharma',
          date_of_birth: '1988-05-15',
          gender: 'Male',
          contact_number: '9876543211',
          email: 'amit@example.com',
          address: '123 Main Street, Mumbai',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        {
          patient_id: 'PAT002', 
          name: 'Priya Patel',
          date_of_birth: '1995-08-22',
          gender: 'Female',
          contact_number: '9876543212',
          email: 'priya@example.com',
          address: '456 Park Avenue, Delhi',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        }
      ];

      for (const patient of patients) {
        const patientQuery = `
          INSERT INTO patients (
            patient_id, name, date_of_birth, gender, contact_number, email, address,
            city, state, pincode, emergency_contact_name, emergency_contact_number, 
            emergency_contact_relation, is_active, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW()
          )
        `;
        
        await executeQuery(patientQuery, [
          patient.patient_id, patient.name, patient.date_of_birth, patient.gender,
          patient.contact_number, patient.email, patient.address, patient.city,
          patient.state, patient.pincode, 'Self', patient.contact_number, 'Self'
        ]);
      }
      
      console.log('✅ Sample patients created');
    }

    // 2. Now create sample prescription with medications
    console.log('Creating sample prescription...');
    
    const doctorsResult = await executeQuery('SELECT id FROM users WHERE role = "doctor" LIMIT 1');
    const patientsResult = await executeQuery('SELECT id FROM patients LIMIT 1');
    const medicinesResult = await executeQuery('SELECT id, name, generic_name, strength, dosage_form, unit_price FROM medicines LIMIT 2');
    
    if (doctorsResult.length > 0 && patientsResult.length > 0 && medicinesResult.length > 0) {
      const doctorId = doctorsResult[0].id;
      const patientId = patientsResult[0].id;
      
      // Check if prescription already exists
      const existingPrescription = await executeQuery('SELECT id FROM prescriptions LIMIT 1');
      
      if (existingPrescription.length === 0) {
        // Create prescription
        const prescriptionId = `RX${Date.now()}`;
        const prescriptionQuery = `
          INSERT INTO prescriptions (
            prescription_id, patient_id, doctor_id, prescription_date, 
            diagnosis, status, total_amount, notes, follow_up_date
          ) VALUES (
            ?, ?, ?, CURDATE(), 'Common Cold with Fever', 'active', 150.00, 
            'Patient advised rest and plenty of fluids. Follow up if symptoms persist.', 
            DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          )
        `;
        
        const prescriptionResult = await executeQuery(prescriptionQuery, [
          prescriptionId, patientId, doctorId
        ]);
        
        const prescriptionDbId = prescriptionResult.insertId;
        
        // Add medications to prescription
        const medications = [
          {
            medicine: medicinesResult[0],
            quantity: 10,
            dosage: '1 tablet',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals with water',
            is_dispensed: false
          },
          {
            medicine: medicinesResult[1] || medicinesResult[0],
            quantity: 20,
            dosage: '2 tablets',
            frequency: 'Three times daily', 
            duration: '7 days',
            instructions: 'Take before meals',
            is_dispensed: false
          }
        ];

        for (const med of medications) {
          const totalPrice = med.quantity * (med.medicine.unit_price || 5.00);
          
          const medicationQuery = `
            INSERT INTO prescription_medications (
              prescription_id, medicine_id, medicine_name, generic_name, 
              strength, dosage_form, quantity, dosage, frequency, duration,
              instructions, unit_price, total_price, is_dispensed
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
          `;
          
          await executeQuery(medicationQuery, [
            prescriptionDbId, med.medicine.id, med.medicine.name, 
            med.medicine.generic_name || med.medicine.name,
            med.medicine.strength || '500mg', 
            med.medicine.dosage_form || 'tablet',
            med.quantity, med.dosage, med.frequency, med.duration,
            med.instructions, med.medicine.unit_price || 5.00, 
            totalPrice, med.is_dispensed
          ]);
        }
        
        console.log('✅ Sample prescription with medications created');
        console.log(`   Prescription ID: ${prescriptionId}`);
      } else {
        console.log('✅ Prescription data already exists');
      }
    }

    console.log('\n🎉 Sample data creation completed!');
    
    // Show summary
    const summary = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM users WHERE role = "doctor"'),
      executeQuery('SELECT COUNT(*) as count FROM patients'),
      executeQuery('SELECT COUNT(*) as count FROM prescriptions'),
      executeQuery('SELECT COUNT(*) as count FROM prescription_medications')
    ]);
    
    console.log('\n📊 Database Summary:');
    console.log(`👨‍⚕️ Doctors: ${summary[0][0].count}`);
    console.log(`👥 Patients: ${summary[1][0].count}`);
    console.log(`📋 Prescriptions: ${summary[2][0].count}`);
    console.log(`💊 Prescription Medications: ${summary[3][0].count}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createSampleData();
