import { NextRequest, NextResponse } from 'next/server'
import { PharmacyService } from '@/lib/services/pharmacy'

const pharmacyService = new PharmacyService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      limit: searchParams.get('limit')
    }

    const prescriptions = await pharmacyService.getPrescriptions(filters)
    return NextResponse.json({ success: true, data: prescriptions })
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const prescription = await pharmacyService.createPrescription(data)
    return NextResponse.json({ success: true, data: prescription }, { status: 201 })
  } catch (error) {
    console.error('Error creating prescription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create prescription' },
      { status: 500 }
    )
  }
}
