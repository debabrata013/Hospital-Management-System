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
    const appointmentId = parseInt(params.id)

    if (isNaN(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 })
    }

    // Get appointment details with patient info
    const appointmentQuery = `
      SELECT 
        a.id,
        a.appointment_date as appointmentDate,
        a.chief_complaint as reason,
        a.status,
        a.notes,
        a.patient_id as patientId,
        p.name,
        p.email,
        p.contact_number as phone,
        YEAR(CURDATE()) - YEAR(p.date_of_birth) as age,
        p.gender
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?
    `
    
    const appointments = await executeQuery(appointmentQuery, [appointmentId]) as any[]

    if (appointments.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const appointment = appointments[0]
    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
