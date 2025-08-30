import { NextRequest, NextResponse } from 'next/server'
import { PharmacyService } from '@/lib/services/pharmacy'

const pharmacyService = new PharmacyService()

export async function GET(request: NextRequest) {
  try {
    const alerts = await pharmacyService.getStockAlerts()
    return NextResponse.json({ success: true, data: alerts })
  } catch (error) {
    console.error('Error fetching stock alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock alerts' },
      { status: 500 }
    )
  }
}
