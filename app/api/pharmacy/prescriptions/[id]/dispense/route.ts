import { NextRequest, NextResponse } from 'next/server'
import { PharmacyService } from '@/lib/services/pharmacy'

const pharmacyService = new PharmacyService()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { items } = await request.json()
    const prescription = await pharmacyService.dispensePrescription(params.id, items || [])
    return NextResponse.json({ success: true, data: prescription })
  } catch (error) {
    console.error('Error dispensing prescription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to dispense prescription' },
      { status: 500 }
    )
  }
}
