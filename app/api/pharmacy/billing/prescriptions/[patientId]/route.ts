import { NextRequest, NextResponse } from 'next/server'
const { executeQuery } = require('@/lib/mysql-connection')

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    // Get prescriptions for the patient
    const prescriptions = await executeQuery(`
      SELECT p.*, u.name as doctor_name
      FROM prescriptions p
      LEFT JOIN users u ON p.doctor_id = u.id
      WHERE p.patient_id = ?
      ORDER BY p.created_at DESC
      LIMIT 10
    `, [params.patientId])

    // Get prescription items for each prescription
    for (const prescription of prescriptions) {
      const items = await executeQuery(`
        SELECT pm.*, m.unit_price, m.current_stock
        FROM prescription_medications pm
        LEFT JOIN medicines m ON pm.medicine_id = m.medicine_id
        WHERE pm.prescription_id = ?
      `, [prescription.id])
      
      prescription.items = items
    }

    return NextResponse.json({ success: true, data: prescriptions })
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescriptions' },
      { status: 500 }
    )
  }
}
