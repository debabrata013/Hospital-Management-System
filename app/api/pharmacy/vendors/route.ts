import { NextRequest, NextResponse } from 'next/server';
import { PharmacyExtendedService } from '@/lib/services/pharmacy-extended';
import { 
  createVendorSchema,
  updateVendorSchema,
  vendorQuerySchema 
} from '@/lib/validations/pharmacy';
import { getServerSession } from '@/lib/auth';

const pharmacyService = new PharmacyExtendedService();

// GET /api/pharmacy/vendors - Get vendors with filtering and pagination
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
      search: searchParams.get('search'),
      businessType: searchParams.get('businessType'),
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: searchParams.get('sortOrder') || 'asc'
    };

    const validation = vendorQuerySchema.safeParse(queryParams);
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

    // For now, return mock data since we need to implement the actual vendor service
    const mockResult = {
      vendors: [],
      pagination: {
        page: queryParams.page,
        limit: queryParams.limit,
        total: 0,
        totalPages: 0
      }
    };

    return NextResponse.json({
      success: true,
      data: mockResult.vendors,
      pagination: mockResult.pagination
    });

  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pharmacy/vendors - Create new vendor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'pharmacy_manager', 'procurement_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createVendorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid vendor data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const vendor = await pharmacyService.createVendor(validation.data, session.user.id);

    return NextResponse.json({
      success: true,
      data: vendor,
      message: 'Vendor created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating vendor:', error);
    
    if (error.message.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'Vendor with this name or contact already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

// PUT /api/pharmacy/vendors - Update vendor
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
    if (!['admin', 'pharmacy_manager', 'procurement_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateVendorSchema.safeParse(body);

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

    // Mock response for now
    const mockVendor = {
      vendorId: validation.data.vendorId,
      ...validation.data.updates,
      lastUpdatedBy: session.user.id,
      lastUpdated: Date.now()
    };

    return NextResponse.json({
      success: true,
      data: mockVendor,
      message: 'Vendor updated successfully'
    });

  } catch (error) {
    console.error('Error updating vendor:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}
