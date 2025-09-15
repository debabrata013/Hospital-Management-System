const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function createAppointmentsViaAPI() {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Login as admin
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact_number: '9876543211',
        password: '654321'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Got cookies:', cookies);

    // Get patients list first
    const patientsResponse = await fetch('http://localhost:3000/api/admin/patients-list', {
      headers: {
        'Cookie': cookies
      }
    });

    const patientsData = await patientsResponse.json();
    console.log('👥 Found patients:', patientsData.length);

    if (patientsData.length === 0) {
      console.log('❌ No patients found');
      return;
    }

    // Create appointments for doctor ID 22
    const today = new Date().toISOString().split('T')[0];
    const appointments = [
      {
        patient_id: patientsData[0].id,
        doctor_id: 22,
        appointment_date: today,
        appointment_time: '09:30',
        appointment_type: 'consultation',
        visit_type: 'new',
        priority: 'normal',
        status: 'scheduled',
        reason_for_visit: 'Routine checkup',
        chief_complaint: 'General health checkup',
        consultation_fee: 500
      },
      {
        patient_id: patientsData[1] ? patientsData[1].id : patientsData[0].id,
        doctor_id: 22,
        appointment_date: today,
        appointment_time: '10:15',
        appointment_type: 'consultation',
        visit_type: 'follow-up',
        priority: 'normal',
        status: 'scheduled',
        reason_for_visit: 'Follow-up consultation',
        chief_complaint: 'Follow-up on previous treatment',
        consultation_fee: 500
      },
      {
        patient_id: patientsData[2] ? patientsData[2].id : patientsData[0].id,
        doctor_id: 22,
        appointment_date: today,
        appointment_time: '11:00',
        appointment_type: 'consultation',
        visit_type: 'new',
        priority: 'high',
        status: 'scheduled',
        reason_for_visit: 'Chest pain evaluation',
        chief_complaint: 'Chest pain and shortness of breath',
        consultation_fee: 500
      }
    ];

    console.log('📅 Creating appointments for today:', today);

    for (let i = 0; i < appointments.length; i++) {
      const appointment = appointments[i];
      console.log(`Creating appointment ${i + 1}...`);

      const createResponse = await fetch('http://localhost:3000/api/admin/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify(appointment)
      });

      if (createResponse.ok) {
        const result = await createResponse.json();
        console.log(`✅ Appointment ${i + 1} created:`, result.appointment_id);
      } else {
        const error = await createResponse.text();
        console.log(`❌ Failed to create appointment ${i + 1}:`, error);
      }
    }

    console.log('🎉 All appointments creation attempts completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAppointmentsViaAPI();
