import { NextRequest, NextResponse } from 'next/server'
import { PharmacyService } from '@/lib/services/pharmacy'

const pharmacyService = new PharmacyService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      medicine_id: searchParams.get('medicine_id') || '',
      transaction_type: searchParams.get('transaction_type') || '',
      start_date: searchParams.get('start_date') || '',
      end_date: searchParams.get('end_date') || '',
      limit: searchParams.get('limit') || ''
    }

    const transactions = await pharmacyService.getStockTransactions(
      filters.medicine_id || undefined, 
      filters
    )
    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    console.error('Error fetching stock transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await pharmacyService.createStockTransaction(data)
    return NextResponse.json({ success: true, message: 'Stock transaction created successfully' })
  } catch (error) {
    console.error('Error creating stock transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create stock transaction' },
      { status: 500 }
    )
  }
}
