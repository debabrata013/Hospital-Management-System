import { NextRequest, NextResponse } from 'next/server'
import { PharmacyService } from '@/lib/services/pharmacy'

const pharmacyService = new PharmacyService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      low_stock: searchParams.get('low_stock') === 'true',
      limit: searchParams.get('limit') || ''
    }

    const medicines = await pharmacyService.getMedicines(filters)
    return NextResponse.json({ success: true, data: medicines })
  } catch (error) {
    console.error('Error fetching medicines:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medicines' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const medicine = await pharmacyService.createMedicine(data)
    return NextResponse.json({ success: true, data: medicine })
  } catch (error) {
    console.error('Error creating medicine:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create medicine' },
      { status: 500 }
    )
  }
}
