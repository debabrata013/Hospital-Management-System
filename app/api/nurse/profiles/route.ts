import { NextRequest, NextResponse } from 'next/server';
import { StaffService } from '@/lib/services/staff';
import { 
  createStaffProfileSchema, 
  updateStaffProfileSchema,
  staffQuerySchema 
} from '@/lib/validations/staff';
import { getServerSession } from '@/lib/auth-simple';

const staffService = new StaffService();

// GET /api/staff/profiles - Get staff profiles with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions (normalize role string for safety)
    const normalizedRole = (session.user.role || '').toLowerCase().replace(/_/g, '-').trim();
    if (!['admin', 'super-admin', 'superadmin', 'hr-manager', 'hr_manager'].includes(normalizedRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search'),
      department: searchParams.get('department'),
      role: searchParams.get('role'),
      employmentStatus: searchParams.get('employmentStatus'),
      shiftType: searchParams.get('shiftType'),
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: searchParams.get('sortOrder') || 'asc'
    };

    const validation = staffQuerySchema.safeParse(queryParams);
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

    const result = await staffService.getStaffProfiles(validation.data);

    return NextResponse.json({
      success: true,
      data: result.profiles,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching staff profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/staff/profiles - Create new staff profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions (normalize role string for safety)
    const normalizedRole = (session.user.role || '').toLowerCase().replace(/_/g, '-').trim();
    if (!['admin', 'super-admin', 'superadmin', 'hr-manager', 'hr_manager'].includes(normalizedRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createStaffProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid staff profile data',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const profile = await staffService.createStaffProfile(validation.data, session.user.id);

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Staff profile created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating staff profile:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: 'Staff profile already exists for this user' },
        { status: 409 }
      );
    }

    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create staff profile' },
      { status: 500 }
    );
  }
}

// PUT /api/staff/profiles - Update staff profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions (normalize role string for safety)
    const normalizedRole = (session.user.role || '').toLowerCase().replace(/_/g, '-').trim();
    if (!['admin', 'super-admin', 'superadmin', 'hr-manager', 'hr_manager'].includes(normalizedRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateStaffProfileSchema.safeParse(body);

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

    const updatedProfile = await staffService.updateStaffProfile(
      validation.data.profileId,
      validation.data.updates,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Staff profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating staff profile:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Staff profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update staff profile' },
      { status: 500 }
    );
  }
}
