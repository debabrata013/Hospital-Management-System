import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/connection';
import { getLoggedInUserId } from '../../../../lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get consultations (completed appointments with notes/diagnosis)
    const query = `
      SELECT 
        a.id,
        a.appointment_date as date,
        a.status,
        a.chief_complaint as reason,
        a.notes,
        a.diagnosis as diagnosis,
        p.id as patientId,
        p.name,
        p.date_of_birth as dateOfBirth,
        p.contact_number as phone,
        p.email
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = ? 
        AND a.status IN ('completed', 'in_progress')
      ORDER BY a.appointment_date DESC
      LIMIT 20
    `;

    const consultationsData: any = await executeQuery(query, [userId]);

    const consultations = consultationsData.map((consultation: any) => {
      const [firstName, ...lastNameParts] = consultation.name.split(' ');
      const lastName = lastNameParts.join(' ');
      return {
        id: consultation.id,
        date: consultation.date,
        status: consultation.status,
        reason: consultation.reason,
        notes: consultation.notes,
        diagnosis: consultation.diagnosis,
        patient: {
          id: consultation.patientId,
          firstName: firstName,
          lastName: lastName,
          name: consultation.name,
          age: new Date().getFullYear() - new Date(consultation.dateOfBirth).getFullYear(),
          phone: consultation.phone,
          email: consultation.email,
        },
      };
    });

    return NextResponse.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { patientId, vitals, chiefComplaint, clinicalNotes, diagnosis, prescriptions } = body;

    if (!patientId || !chiefComplaint || !diagnosis) {
      return NextResponse.json({ error: 'Patient, chief complaint, and diagnosis are required.' }, { status: 400 });
    }

    // Combine vitals and clinical notes
    const notes = JSON.stringify({ 
      vitals: vitals,
      clinical: clinicalNotes 
    });

    // Use a transaction to ensure atomicity
    const connection = await executeQuery('START TRANSACTION');

    try {
      // Generate unique appointment ID
      const uniqueAppointmentId = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 1. Create the appointment record
      const appointmentQuery = `
        INSERT INTO appointments (appointment_id, doctor_id, patient_id, appointment_date, chief_complaint, notes, diagnosis, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', NOW())
      `;
      const appointmentResult: any = await executeQuery(appointmentQuery, [
        uniqueAppointmentId,
        userId,
        patientId,
        new Date(), // Use a Date object, the driver will format it
        chiefComplaint,
        notes,
        diagnosis
      ]);
      const appointmentId = appointmentResult.insertId;

      let prescriptionId: number | null = null;

      // 2. If there are prescriptions, create a record in the prescriptions table first
      if (prescriptions && prescriptions.length > 0 && prescriptions.some((p: any) => p.medicine)) {
        const prescriptionRecordQuery = `
          INSERT INTO prescriptions (prescription_id, patient_id, doctor_id, prescription_date, final_diagnosis, status)
          VALUES (?, ?, ?, CURDATE(), ?, 'active')
        `;
        const uniquePrescriptionId = `RX-${Date.now()}`;
        const prescriptionResult: any = await executeQuery(prescriptionRecordQuery, [
          uniquePrescriptionId,
          patientId,
          userId,
          diagnosis
        ]);
        prescriptionId = prescriptionResult.insertId;

        // 3. Then, insert each medication into prescription_medications
        const validPrescriptions = prescriptions.filter((p: any) => p.medicine);
        
        if (validPrescriptions.length > 0) {
          for (const prescription of validPrescriptions) {
            const medicationQuery = `
              INSERT INTO prescription_medications (prescription_id, medicine_name, dosage, frequency, duration, quantity, medicine_id)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            // Note: medicine_id and quantity are hardcoded as they are NOT NULL but not available from the form.
            // This should be addressed by updating the frontend form to include medicine selection.
            await executeQuery(medicationQuery, [
              prescriptionId, 
              prescription.medicine, 
              prescription.dosage, 
              prescription.frequency, 
              prescription.duration, 
              10, // placeholder quantity
              1   // placeholder medicine_id
            ]);
          }
        }
      }

      await executeQuery('COMMIT');
      return NextResponse.json({ id: appointmentId, message: 'Consultation saved successfully' }, { status: 201 });

    } catch (e) {
      await executeQuery('ROLLBACK');
      throw e; // Rethrow to be caught by the outer catch block
    }

  } catch (error) {
    console.error('Error creating consultation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
