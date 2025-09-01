import { NextRequest, NextResponse } from 'next/server'
import { PharmacyService } from '@/lib/services/pharmacy'

const pharmacyService = new PharmacyService()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const medicine = await pharmacyService.getMedicineById(params.id)
    if (!medicine) {
      return NextResponse.json(
        { success: false, error: 'Medicine not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: medicine })
  } catch (error) {
    console.error('Error fetching medicine:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medicine' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const medicine = await pharmacyService.updateMedicine(params.id, data)
    return NextResponse.json({ success: true, data: medicine })
  } catch (error) {
    console.error('Error updating medicine:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update medicine' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await pharmacyService.deleteMedicine(params.id)
    return NextResponse.json({ success: true, message: 'Medicine deleted successfully' })
  } catch (error) {
    console.error('Error deleting medicine:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete medicine' },
      { status: 500 }
    )
  }
}
