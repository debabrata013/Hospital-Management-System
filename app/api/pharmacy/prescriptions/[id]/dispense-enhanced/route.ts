import { NextRequest, NextResponse } from 'next/server'
import { enhancedPharmacyService } from '@/lib/services/pharmacy-enhanced'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { items } = await request.json()
    
    // Validate request
    if (!params.id) {
      return NextResponse.json(
        { success: false, error: 'Prescription ID is required' },
        { status: 400 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items array is required and cannot be empty' },
        { status: 400 }
      )
    }

    // Validate each item
    for (const item of items) {
      if (!item.medicine_id || !item.quantity || !item.unit_price || !item.medicine_name) {
        return NextResponse.json(
          { success: false, error: 'Each item must have medicine_id, quantity, unit_price, and medicine_name' },
          { status: 400 }
        )
      }

      if (item.quantity <= 0 || item.unit_price <= 0) {
        return NextResponse.json(
          { success: false, error: 'Quantity and unit_price must be positive numbers' },
          { status: 400 }
        )
      }
    }

    // Dispense prescription with auto-billing
    const result = await enhancedPharmacyService.dispensePrescriptionWithAutoBilling(params.id, items)
    
    return NextResponse.json({
      success: true,
      data: result,
      message: result.message
    })

  } catch (error) {
    console.error('Error in enhanced prescription dispensing:', error)
    
    // Return appropriate error response
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      )
    }
    
    if (error.message.includes('already dispensed')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to dispense prescription with auto-billing' },
      { status: 500 }
    )
  }
}

// GET method to check dispensing status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescription = await enhancedPharmacyService.getPrescriptionById(params.id)
    
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        prescription_id: prescription.prescription_id,
        status: prescription.status,
        can_dispense: prescription.status === 'pending',
        items: prescription.items || []
      }
    })

  } catch (error) {
    console.error('Error checking prescription status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check prescription status' },
      { status: 500 }
    )
  }
}
