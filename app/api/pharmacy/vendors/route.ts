import { NextRequest, NextResponse } from 'next/server'
import { PharmacyService } from '@/lib/services/pharmacy'

const pharmacyService = new PharmacyService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search'),
      status: searchParams.get('status')
    }

    const vendors = await pharmacyService.getVendors(filters)
    return NextResponse.json({ success: true, data: vendors })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const vendor = await pharmacyService.createVendor(data)
    return NextResponse.json({ success: true, data: vendor }, { status: 201 })
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
}
