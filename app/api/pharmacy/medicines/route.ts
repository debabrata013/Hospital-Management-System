import { NextRequest, NextResponse } from 'next/server';
import { PharmacyService } from '@/lib/services/pharmacy';
import { 
  createMedicineSchema, 
  updateMedicineSchema,
  medicineQuerySchema 
} from '@/lib/validations/pharmacy';
import { getServerSession } from '@/lib/auth';

const pharmacyService = new PharmacyService();

// GET /api/pharmacy/medicines - Get medicines with filtering and pagination
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
      category: searchParams.get('category'),
      manufacturer: searchParams.get('manufacturer'),
      stockStatus: searchParams.get('stockStatus'),
      expiryStatus: searchParams.get('expiryStatus'),
      sortBy: searchParams.get('sortBy') || 'medicineName',
      sortOrder: searchParams.get('sortOrder') || 'asc'
    };

    const validation = medicineQuerySchema.safeParse(queryParams);
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

    const result = await pharmacyService.getMedicines(validation.data);

    return NextResponse.json({
      success: true,
      data: result.medicines,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pharmacy/medicines - Create new medicine
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
    if (!['admin', 'pharmacy_manager', 'pharmacist'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createMedicineSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid medicine data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const medicine = await pharmacyService.createMedicine(validation.data, session.user.id);

    return NextResponse.json({
      success: true,
      data: medicine,
      message: 'Medicine created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating medicine:', error);
    
    if (error.message.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'Medicine with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create medicine' },
      { status: 500 }
    );
  }
}

// PUT /api/pharmacy/medicines - Update medicine
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
    if (!['admin', 'pharmacy_manager', 'pharmacist'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateMedicineSchema.safeParse(body);

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

    const updatedMedicine = await pharmacyService.updateMedicine(
      validation.data.medicineId,
      validation.data.updates,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: updatedMedicine,
      message: 'Medicine updated successfully'
    });

  } catch (error) {
    console.error('Error updating medicine:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Medicine not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update medicine' },
      { status: 500 }
    );
  }
}
