import { isStaticBuild } from '@/lib/api-utils';

// Force dynamic for development server
// Generate static parameters for build
export async function generateStaticParams() {
  // During static build, we provide a list of IDs to pre-render
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const patientId = parseInt(params.id)

    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 })
    }

    // Get patient details
    const patientQuery = `
      SELECT 
        id,
        name,
        email,
        contact_number as phone,
        YEAR(CURDATE()) - YEAR(date_of_birth) as age,
        gender,
        address,
        date_of_birth as dateOfBirth,
        blood_group as bloodGroup,
        emergency_contact_number as emergencyContact,
        medical_history as medicalHistory
      FROM patients 
      WHERE id = ?
    `
    
    const patients = await executeQuery(patientQuery, [patientId]) as any[]

    if (patients.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const patient = patients[0]
    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
