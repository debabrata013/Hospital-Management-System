import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../../../../../lib/db/connection'
import { getLoggedInUserId } from '../../../../../lib/auth-utils'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getLoggedInUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patientId = params.id

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    // Query to get patient details
    const query = `
      SELECT 
        id,
        name,
        firstName,
        lastName,
        age,
        gender,
        contact_number as contactNumber,
        email,
        address,
        emergency_contact as emergencyContact,
        blood_group as bloodGroup,
        medical_history as medicalHistory,
        allergies,
        created_at as createdAt,
        updated_at as updatedAt
      FROM patients 
      WHERE id = ?
    `

    const patients = await executeQuery(query, [patientId]) as any[]

    if (!patients || patients.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const patient = patients[0]

    // Parse JSON fields if they exist
    if (patient.medicalHistory && typeof patient.medicalHistory === 'string') {
      try {
        patient.medicalHistory = JSON.parse(patient.medicalHistory)
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    if (patient.allergies && typeof patient.allergies === 'string') {
      try {
        patient.allergies = JSON.parse(patient.allergies)
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    return NextResponse.json(patient)

  } catch (error) {
    console.error('Error fetching patient details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
