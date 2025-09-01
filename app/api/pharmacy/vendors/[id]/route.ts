import { NextRequest, NextResponse } from 'next/server'
import { PharmacyService } from '@/lib/services/pharmacy'

const pharmacyService = new PharmacyService()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const vendor = await pharmacyService.updateVendor(params.id, data)
    return NextResponse.json({ success: true, data: vendor })
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await pharmacyService.deleteVendor(params.id)
    return NextResponse.json({ success: true, message: 'Vendor deleted successfully' })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}
