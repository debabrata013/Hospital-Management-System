// Create simple prescription data for testing
// Hospital Management System - Arogya Hospital

const { executeQuery } = require('../lib/mysql-connection.js');

async function createSimplePrescription() {
  try {
    console.log('Creating simple prescription data...');
    
    const doctorsResult = await executeQuery('SELECT id FROM users WHERE role = "doctor" LIMIT 1');
    const patientsResult = await executeQuery('SELECT id FROM patients LIMIT 1');
    const medicinesResult = await executeQuery('SELECT id, name, generic_name, strength, dosage_form, unit_price FROM medicines LIMIT 2');
    
    if (doctorsResult.length > 0 && patientsResult.length > 0 && medicinesResult.length > 0) {
      const doctorId = doctorsResult[0].id;
      const patientId = patientsResult[0].id;
      
      // Check if prescription already exists
      const existingPrescription = await executeQuery('SELECT id FROM prescriptions LIMIT 1');
      
      if (existingPrescription.length === 0) {
        // Create prescription with only available columns
        const prescriptionId = `RX${Date.now()}`;
        const prescriptionQuery = `
          INSERT INTO prescriptions (
            prescription_id, patient_id, doctor_id, prescription_date, 
            status, total_amount, notes, follow_up_date
          ) VALUES (
            ?, ?, ?, CURDATE(), 'active', 150.00, 
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
          }
        ];

        if (medicinesResult[1]) {
          medications.push({
            medicine: medicinesResult[1],
            quantity: 20,
            dosage: '2 tablets',
            frequency: 'Three times daily', 
            duration: '7 days',
            instructions: 'Take before meals',
            is_dispensed: false
          });
        }

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
        console.log(`   Patient ID: ${patientId}`);
        console.log(`   Doctor ID: ${doctorId}`);
        console.log(`   Medications: ${medications.length}`);
      } else {
        console.log('✅ Prescription data already exists');
      }
    } else {
      console.log('⚠️  Missing required data:');
      console.log(`   Doctors: ${doctorsResult.length}`);
      console.log(`   Patients: ${patientsResult.length}`);
      console.log(`   Medicines: ${medicinesResult.length}`);
    }

    // Show final summary
    const summary = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM users WHERE role = "doctor"'),
      executeQuery('SELECT COUNT(*) as count FROM patients'),
      executeQuery('SELECT COUNT(*) as count FROM prescriptions'),
      executeQuery('SELECT COUNT(*) as count FROM prescription_medications')
    ]);
    
    console.log('\n📊 Final Database Summary:');
    console.log(`👨‍⚕️ Doctors: ${summary[0][0].count}`);
    console.log(`👥 Patients: ${summary[1][0].count}`);
    console.log(`📋 Prescriptions: ${summary[2][0].count}`);
    console.log(`💊 Prescription Medications: ${summary[3][0].count}`);

  } catch (error) {
    console.error('❌ Error creating prescription:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createSimplePrescription();
