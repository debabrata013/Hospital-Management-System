import { NextRequest, NextResponse } from 'next/server';
import { StaffService } from '@/lib/services/staff';
import LeaveRequest from '@/models/LeaveRequest';
import { 
  createLeaveRequestSchema, 
  updateLeaveRequestSchema,
  leaveQuerySchema,
  approveLeaveSchema,
  rejectLeaveSchema,
  extendLeaveSchema
} from '@/lib/validations/staff';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const staffService = new StaffService();

// GET /api/staff/leaves - Get leave requests with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      staffId: searchParams.get('staffId'),
      leaveType: searchParams.get('leaveType'),
      status: searchParams.get('status'),
      urgency: searchParams.get('urgency'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      approverId: searchParams.get('approverId'),
      sortBy: searchParams.get('sortBy') || 'startDate',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    };

    const validation = leaveQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    // If not admin/manager, restrict to own leaves or leaves requiring approval
    if (!['admin', 'super-admin', 'hr_manager', 'department_head'].includes(session.user.role)) {
      // Show own leaves or leaves where user is an approver
      validation.data.staffId = session.user.id;
    }

    const skip = (validation.data.page - 1) * validation.data.limit;
    const query: any = {};

    if (validation.data.staffId) query.staffId = validation.data.staffId;
    if (validation.data.leaveType) query.leaveType = validation.data.leaveType;
    if (validation.data.status) query.status = validation.data.status;
    if (validation.data.urgency) query.urgency = validation.data.urgency;
    if (validation.data.approverId) query['approvalWorkflow.approverId'] = validation.data.approverId;

    if (validation.data.dateFrom || validation.data.dateTo) {
      query.$or = [
        {
          startDate: {
            ...(validation.data.dateFrom && { $gte: new Date(validation.data.dateFrom) }),
            ...(validation.data.dateTo && { $lte: new Date(validation.data.dateTo) })
          }
        }
      ];
    }

    const sortConfig: any = {};
    sortConfig[validation.data.sortBy] = validation.data.sortOrder === 'desc' ? -1 : 1;

    const [leaves, total] = await Promise.all([
      LeaveRequest.find(query)
        .populate('staffId', 'name employeeId role department')
        .populate('approvalWorkflow.approverId', 'name role')
        .populate('coverage.coveringStaff.staffId', 'name employeeId')
        .populate('createdBy', 'name')
        .sort(sortConfig)
        .skip(skip)
        .limit(validation.data.limit)
        .lean(),
      LeaveRequest.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: leaves,
      pagination: {
        page: validation.data.page,
        limit: validation.data.limit,
        total,
        totalPages: Math.ceil(total / validation.data.limit)
      }
    });

  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/staff/leaves - Create leave request or perform leave actions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'create' || !action) {
      const validation = createLeaveRequestSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid leave request data',
            details: validation.error.errors 
          },
          { status: 400 }
        );
      }

      // Staff can only create leave requests for themselves unless they're admin/manager
      if (!['admin', 'super-admin', 'hr_manager'].includes(session.user.role)) {
        validation.data.staffId = session.user.id;
      }

      const leaveRequest = await staffService.createLeaveRequest(validation.data, session.user.id);

      return NextResponse.json({
        success: true,
        data: leaveRequest,
        message: 'Leave request created successfully'
      }, { status: 201 });

    } else if (action === 'approve') {
      const validation = approveLeaveSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid approval data',
            details: validation.error.errors 
          },
          { status: 400 }
        );
      }

      const leaveRequest = await LeaveRequest.findById(validation.data.leaveRequestId);
      if (!leaveRequest) {
        return NextResponse.json(
          { success: false, error: 'Leave request not found' },
          { status: 404 }
        );
      }

      // Check if user is authorized to approve this leave
      const canApprove = leaveRequest.approvalWorkflow.some(approval => 
        approval.approverId?.toString() === session.user.id && approval.status === 'Pending'
      );

      if (!canApprove && !['admin', 'super-admin'].includes(session.user.role)) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to approve this leave request' },
          { status: 403 }
        );
      }

      await leaveRequest.approve(
        validation.data.approverId,
        validation.data.comments,
        validation.data.conditions
      );

      return NextResponse.json({
        success: true,
        data: leaveRequest,
        message: 'Leave request approved successfully'
      });

    } else if (action === 'reject') {
      const validation = rejectLeaveSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid rejection data',
            details: validation.error.errors 
          },
          { status: 400 }
        );
      }

      const leaveRequest = await LeaveRequest.findById(validation.data.leaveRequestId);
      if (!leaveRequest) {
        return NextResponse.json(
          { success: false, error: 'Leave request not found' },
          { status: 404 }
        );
      }

      // Check if user is authorized to reject this leave
      const canReject = leaveRequest.approvalWorkflow.some(approval => 
        approval.approverId?.toString() === session.user.id && approval.status === 'Pending'
      );

      if (!canReject && !['admin', 'super-admin'].includes(session.user.role)) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to reject this leave request' },
          { status: 403 }
        );
      }

      await leaveRequest.reject(validation.data.approverId, validation.data.comments);

      return NextResponse.json({
        success: true,
        data: leaveRequest,
        message: 'Leave request rejected'
      });

    } else if (action === 'extend') {
      const validation = extendLeaveSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid extension data',
            details: validation.error.errors 
          },
          { status: 400 }
        );
      }

      const leaveRequest = await LeaveRequest.findById(validation.data.leaveRequestId);
      if (!leaveRequest) {
        return NextResponse.json(
          { success: false, error: 'Leave request not found' },
          { status: 404 }
        );
      }

      // Check if user can extend this leave (own leave or admin/manager)
      const canExtend = leaveRequest.staffId.toString() === session.user.id || 
                       ['admin', 'super-admin', 'hr_manager'].includes(session.user.role);

      if (!canExtend) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to extend this leave request' },
          { status: 403 }
        );
      }

      await leaveRequest.extendLeave(validation.data, session.user.id);

      return NextResponse.json({
        success: true,
        data: leaveRequest,
        message: 'Leave extended successfully'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action specified' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing leave operation:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes('overlapping') || 
        error.message.includes('already has')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process leave operation' },
      { status: 500 }
    );
  }
}

// PUT /api/staff/leaves - Update leave request
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateLeaveRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid update data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveRequest.findById(validation.data.leaveRequestId);
    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canUpdate = leaveRequest.staffId.toString() === session.user.id || 
                     ['admin', 'super-admin', 'hr_manager'].includes(session.user.role);

    if (!canUpdate) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this leave request' },
        { status: 403 }
      );
    }

    Object.assign(leaveRequest, validation.data.updates);
    leaveRequest.lastUpdatedBy = session.user.id;
    await leaveRequest.save();

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      message: 'Leave request updated successfully'
    });

  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update leave request' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/leaves - Cancel leave request
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const leaveRequestId = searchParams.get('leaveRequestId');
    const reason = searchParams.get('reason');

    if (!leaveRequestId) {
      return NextResponse.json(
        { success: false, error: 'Leave request ID is required' },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveRequest.findById(leaveRequestId);
    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const canCancel = leaveRequest.staffId.toString() === session.user.id || 
                     ['admin', 'super-admin', 'hr_manager'].includes(session.user.role);

    if (!canCancel) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to cancel this leave request' },
        { status: 403 }
      );
    }

    // Can only cancel pending or approved leaves that haven't started
    if (!['Pending', 'Approved'].includes(leaveRequest.status)) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel leave request in current status' },
        { status: 400 }
      );
    }

    if (new Date() >= new Date(leaveRequest.startDate)) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel leave that has already started' },
        { status: 400 }
      );
    }

    await leaveRequest.cancel(session.user.id, reason || 'Cancelled by user');

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      message: 'Leave request cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling leave request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel leave request' },
      { status: 500 }
    );
  }
}
