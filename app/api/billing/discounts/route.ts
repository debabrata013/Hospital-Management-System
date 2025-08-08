import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logAuditAction } from '@/lib/auth-middleware'
import { connectToDatabase } from '@/lib/mongodb'
import { Billing } from '@/models'

// GET - Get pending discount requests
export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (auth instanceof NextResponse) return auth

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query for discount requests
    const query: any = {}
    
    if (status === 'pending') {
      query['discount.amount'] = { $gt: 0 }
      query['discount.approvedBy'] = { $exists: false }
    } else if (status === 'approved') {
      query['discount.approvedBy'] = { $exists: true }
    }

    // Get total count
    const total = await Billing.countDocuments(query)

    // Get discount requests with patient and user details
    const discountRequests = await Billing.find(query)
      .populate('patientId', 'name patientId contactNumber')
      .populate('discount.approvedBy', 'name role')
      .populate('generatedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform data for frontend
    const transformedRequests = discountRequests.map(bill => ({
      id: bill._id,
      billId: bill.billId,
      patient: bill.patientId,
      originalAmount: bill.totalAmount,
      discountAmount: bill.discount?.amount || 0,
      discountPercentage: bill.discount?.percentage || 0,
      discountReason: bill.discount?.reason || '',
      finalAmount: bill.finalAmount,
      requestedBy: bill.generatedBy,
      requestedAt: bill.createdAt,
      approvedBy: bill.discount?.approvedBy,
      approvedAt: bill.discount?.approvedAt,
      status: bill.discount?.approvedBy ? 'approved' : 'pending'
    }))

    return NextResponse.json({
      success: true,
      data: {
        requests: transformedRequests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Discount requests fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discount requests' },
      { status: 500 }
    )
  }
}

// POST - Approve or reject discount request
export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (auth instanceof NextResponse) return auth

    await connectToDatabase()

    const body = await request.json()
    const { billId, action, remarks } = body

    if (!billId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Find the billing record
    const bill = await Billing.findById(billId)
      .populate('patientId', 'name patientId')

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      )
    }

    // Check if already processed
    if (bill.discount?.approvedBy) {
      return NextResponse.json(
        { error: 'Discount request already processed' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Approve the discount
      bill.discount.approvedBy = auth.user.id
      bill.discount.approvedAt = new Date()
      if (remarks) {
        bill.discount.remarks = remarks
      }

      await bill.save()

      // Log audit action
      await logAuditAction(
        auth.user.id,
        `Approved discount of ₹${bill.discount.amount} for bill ${bill.billId}`,
        'APPROVE',
        'Billing',
        billId,
        request.ip,
        request.headers.get('user-agent')
      )

      return NextResponse.json({
        success: true,
        message: 'Discount approved successfully',
        data: {
          billId: bill.billId,
          discountAmount: bill.discount.amount,
          approvedBy: auth.user.name,
          approvedAt: bill.discount.approvedAt
        }
      })

    } else if (action === 'reject') {
      // Reject the discount - remove discount and recalculate
      const originalTotal = bill.subtotal + bill.totalTax
      
      bill.discount = {
        amount: 0,
        percentage: 0,
        reason: `Rejected: ${remarks || 'No reason provided'}`,
        approvedBy: auth.user.id,
        approvedAt: new Date()
      }
      bill.finalAmount = originalTotal

      await bill.save()

      // Log audit action
      await logAuditAction(
        auth.user.id,
        `Rejected discount request for bill ${bill.billId}`,
        'REJECT',
        'Billing',
        billId,
        request.ip,
        request.headers.get('user-agent')
      )

      return NextResponse.json({
        success: true,
        message: 'Discount request rejected',
        data: {
          billId: bill.billId,
          rejectedBy: auth.user.name,
          rejectedAt: new Date(),
          remarks
        }
      })
    }

  } catch (error) {
    console.error('Discount approval error:', error)
    return NextResponse.json(
      { error: 'Failed to process discount request' },
      { status: 500 }
    )
  }
}
