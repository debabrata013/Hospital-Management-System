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

    // Get patient appointments
    const appointmentsQuery = `
      SELECT 
        a.id,
        a.appointment_date as appointmentDate,
        a.chief_complaint as reason,
        a.status,
        a.notes,
        p.id as patientId,
        p.name,
        p.email,
        p.contact_number as phone
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC
    `
    
    const appointments = await executeQuery(appointmentsQuery, [patientId]) as any[]

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching patient appointments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
