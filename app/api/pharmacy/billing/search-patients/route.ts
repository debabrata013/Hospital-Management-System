import { NextRequest, NextResponse } from 'next/server'
const { executeQuery } = require('@/lib/mysql-connection')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const loadAll = searchParams.get('all') === 'true'

    let patients

    if (loadAll || !query.trim()) {
      // Load all patients (limited to 50 for performance)
      patients = await executeQuery(`
        SELECT id, patient_id, name, contact_number, email, address
        FROM patients 
        WHERE is_active = 1
        ORDER BY name
        LIMIT 50
      `, [])
    } else {
      // Search specific patients
      patients = await executeQuery(`
        SELECT id, patient_id, name, contact_number, email, address
        FROM patients 
        WHERE (name LIKE ? OR patient_id LIKE ? OR contact_number LIKE ?)
        AND is_active = 1
        ORDER BY name
        LIMIT 20
      `, [`%${query}%`, `%${query}%`, `%${query}%`])
    }

    return NextResponse.json({ success: true, data: patients })
  } catch (error) {
    console.error('Error searching patients:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search patients' },
      { status: 500 }
    )
  }
}
