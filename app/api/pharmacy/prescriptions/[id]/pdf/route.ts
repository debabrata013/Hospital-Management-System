import { NextRequest, NextResponse } from 'next/server'
import { pharmacyService } from '@/lib/services/pharmacy'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescription = await pharmacyService.getPrescriptionById(params.id)
    
    if (!prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      )
    }

    // Return prescription data for PDF generation
    return NextResponse.json({
      success: true,
      data: {
        prescription_id: prescription.prescription_id,
        patient_name: prescription.patient_name,
        patient_id: prescription.patient_id,
        doctor_name: prescription.doctor_name,
        prescription_date: prescription.prescription_date,
        items: prescription.items || [],
        total_amount: prescription.total_amount || 0,
        notes: prescription.notes
      }
    })

  } catch (error) {
    console.error('Error fetching prescription for PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescription data' },
      { status: 500 }
    )
  }
}
