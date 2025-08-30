import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-middleware';
import db from '@/backend/models';

export async function POST(request: Request) {
  const authResult = await authenticateUser(request as any);
  if (authResult instanceof NextResponse) {
    return authResult; // Return error response if authentication fails
  }

  const { user } = authResult;

  if (user.role !== 'doctor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { Consultation, Vitals, Prescription } = await db();
    const body = await request.json();

    const { patientId, vitals, chiefComplaint, clinicalNotes, diagnosis, prescriptions } = body;

    if (!patientId || !vitals || !chiefComplaint || !diagnosis) {
      return NextResponse.json({ error: 'Missing required consultation fields' }, { status: 400 });
    }

    // Create the main consultation record
    const newConsultation = await Consultation.create({
      patientId,
      doctorId: user.id,
      chiefComplaint,
      diagnosis,
      notes: clinicalNotes,
      status: 'completed', // Or handle status as needed
      date: new Date(),
    });

    // Create the associated vitals record
    await Vitals.create({
      consultationId: newConsultation.id,
      ...vitals,
    });

    // Create prescription records if any
    if (prescriptions && prescriptions.length > 0) {
      for (const p of prescriptions) {
        if (p.medicine) { // Only save if medicine name is present
          await Prescription.create({
            consultationId: newConsultation.id,
            patientId,
            doctorId: user.id,
            ...p,
          });
        }
      }
    }

    return NextResponse.json(newConsultation, { status: 201 });
  } catch (error) {
    console.error('Failed to create consultation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create consultation', details: errorMessage }, { status: 500 });
  }
}
