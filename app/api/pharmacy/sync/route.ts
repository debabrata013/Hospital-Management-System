import { NextRequest, NextResponse } from 'next/server'
import { enhancedPharmacyService } from '@/lib/services/pharmacy-enhanced'

// POST - Sync offline data
export async function POST(request: NextRequest) {
  try {
    const { items, force_sync = false } = await request.json()
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Items array is required' },
        { status: 400 }
      )
    }

    const results = {
      synced: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process each offline item
    for (const item of items) {
      try {
        if (item.type === 'billing') {
          // Validate and create billing entry
          const validatedBill = await enhancedPharmacyService.createOfflineBillWithValidation(item.data)
          
          // Create the bill in database
          const response = await fetch('/api/pharmacy/billing/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validatedBill)
          })

          if (response.ok) {
            results.synced++
          } else {
            throw new Error('Failed to create bill')
          }
          
        } else if (item.type === 'prescription') {
          // Handle prescription sync
          const response = await fetch('/api/pharmacy/prescriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data)
          })

          if (response.ok) {
            results.synced++
          } else {
            throw new Error('Failed to create prescription')
          }
        }
        
      } catch (error) {
        results.failed++
        results.issues.push(`Item ${item.id}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Synced ${results.synced} items, ${results.failed} failed`
    })

  } catch (error) {
    console.error('Error in sync endpoint:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync offline data' },
      { status: 500 }
    )
  }
}

// GET - Get sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const include_items = searchParams.get('include_items') === 'true'
    
    // This would typically check IndexedDB or a sync status table
    // For now, return a mock status
    const syncStatus = {
      last_sync: new Date().toISOString(),
      pending_items: 0,
      sync_in_progress: false,
      last_error: null
    }

    if (include_items) {
      // In a real implementation, this would fetch pending items
      syncStatus['pending_items_details'] = []
    }

    return NextResponse.json({
      success: true,
      data: syncStatus
    })

  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}
