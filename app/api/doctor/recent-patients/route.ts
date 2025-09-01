import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const patients = [
      { 
        id: 'P001', 
        firstName: 'राजेश', 
        lastName: 'कुमार',
        age: 45,
        lastVisit: new Date().toISOString(), 
        condition: 'Hypertension',
        status: 'stable'
      },
      { 
        id: 'P002', 
        firstName: 'सुनीता', 
        lastName: 'देवी',
        age: 38,
        lastVisit: new Date().toISOString(), 
        condition: 'Diabetes',
        status: 'under_observation'
      },
      { 
        id: 'P003', 
        firstName: 'मोहम्मद', 
        lastName: 'अली',
        age: 62,
        lastVisit: new Date().toISOString(), 
        condition: 'Post-Surgery Recovery',
        status: 'improving'
      }
    ];
    return NextResponse.json(patients);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
