import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const tasks = [
      {
        id: '1',
        type: 'lab_review',
        description: 'Review Lab Results',
        priority: 'high',
        dueDate: new Date().toISOString(),
        Patient: {
          id: 'P001',
          firstName: 'राजेश',
          lastName: 'कुमार'
        }
      },
      {
        id: '2',
        type: 'prescription_review',
        description: 'Update Prescription',
        priority: 'medium',
        dueDate: new Date().toISOString(),
        Patient: {
          id: 'P002',
          firstName: 'सुनीता',
          lastName: 'देवी'
        }
      }
    ];
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
