import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Mock data for appointments
    const appointments = [
      {
        id: 'APT001',
        appointmentDate: new Date().toISOString(),
        reason: "Follow-up",
        status: 'completed',
        Patient: {
          id: "P001",
          firstName: "राजेश",
          lastName: "कुमार",
        }
      },
      {
        id: 'APT002',
        appointmentDate: new Date().toISOString(),
        reason: "Consultation",
        status: 'in_progress',
        Patient: {
          id: "P002",
          firstName: "सुनीता",
          lastName: "देवी",
        }
      },
      {
        id: 'APT003',
        appointmentDate: new Date().toISOString(),
        reason: "Check-up",
        status: 'waiting',
        Patient: {
          id: "P003",
          firstName: "मोहम्मद",
          lastName: "अली",
        }
      }
    ];
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
