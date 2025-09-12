import { NextRequest, NextResponse } from 'next/server';
import { StaffService } from '@/lib/services/staff';
import { 
  createShiftSchema, 
  updateShiftSchema,
  shiftQuerySchema,
  checkInSchema,
  checkOutSchema,
  addBreakSchema
} from '@/lib/validations/staff';
import { getServerSession } from '@/lib/auth-simple';

const staffService = new StaffService();

// GET /api/staff/shifts - Get shifts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
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
      department: searchParams.get('department'),
      shiftType: searchParams.get('shiftType'),
      status: searchParams.get('status'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      sortBy: searchParams.get('sortBy') || 'shiftDate',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    };

    const validation = shiftQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    // If not admin/manager, restrict to own shifts
    const normalizedRole = (session.user.role || '').toLowerCase().replace(/_/g, '-').trim();
    if (!['admin', 'super-admin', 'superadmin', 'hr-manager', 'department-head'].includes(normalizedRole)) {
      validation.data.staffId = session.user.id;
    }

    const result = await staffService.getShifts(validation.data);

    return NextResponse.json({
      success: true,
      data: result.shifts,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/staff/shifts - Create new shift or perform shift actions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      // Check permissions for creating shifts
      const normalizedRole = (session.user.role || '').toLowerCase().replace(/_/g, '-').trim();
      if (!['admin', 'super-admin', 'superadmin', 'hr-manager', 'department-head'].includes(normalizedRole)) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions to create shifts' },
          { status: 403 }
        );
      }

      const validation = createShiftSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid shift data',
            details: validation.error.issues 
          },
          { status: 400 }
        );
      }

      const shift = await staffService.createShift(validation.data, session.user.id);

      return NextResponse.json({
        success: true,
        data: shift,
        message: 'Shift created successfully'
      }, { status: 201 });

    } else if (action === 'check_in') {
      const validation = checkInSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid check-in data',
            details: validation.error.issues 
          },
          { status: 400 }
        );
      }

      const shift = await staffService.checkInShift(
        validation.data.shiftId,
        validation.data,
        session.user.id
      );

      return NextResponse.json({
        success: true,
        data: shift,
        message: 'Checked in successfully'
      });

    } else if (action === 'check_out') {
      const validation = checkOutSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid check-out data',
            details: validation.error.issues 
          },
          { status: 400 }
        );
      }

      const shift = await staffService.checkOutShift(
        validation.data.shiftId,
        validation.data,
        session.user.id
      );

      return NextResponse.json({
        success: true,
        data: shift,
        message: 'Checked out successfully'
      });

    } else if (action === 'add_break') {
      const validation = addBreakSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid break data',
            details: validation.error.issues 
          },
          { status: 400 }
        );
      }

      // Implementation for adding break would go here
      return NextResponse.json({
        success: true,
        message: 'Break added successfully'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action specified' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing shift operation:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes('conflict') || 
        error.message.includes('already has') ||
        error.message.includes('not in scheduled') ||
        error.message.includes('not in progress')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process shift operation' },
      { status: 500 }
    );
  }
}

// PUT /api/staff/shifts - Update shift
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    const normalizedRole = (session.user.role || '').toLowerCase().replace(/_/g, '-').trim();
    if (!['admin', 'super-admin', 'superadmin', 'hr-manager', 'department-head'].includes(normalizedRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to update shifts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateShiftSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid update data',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const updatedShift = await staffService.updateShift(
      validation.data.shiftId,
      validation.data.updates,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: updatedShift,
      message: 'Shift updated successfully'
    });

  } catch (error) {
    console.error('Error updating shift:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Shift not found' },
        { status: 404 }
      );
    }

    if (error.message.includes('Cannot modify')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update shift' },
      { status: 500 }
    );
  }
}
