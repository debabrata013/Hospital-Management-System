import { NextRequest, NextResponse } from 'next/server';
import { PharmacyExtendedService } from '@/lib/services/pharmacy-extended';
import { 
  dispensePrescriptionSchema,
  prescriptionQuerySchema 
} from '@/lib/validations/pharmacy';
import { getServerSession } from '@/lib/auth';

const pharmacyService = new PharmacyExtendedService();

// GET /api/pharmacy/prescriptions - Get prescriptions for dispensing
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
      patientId: searchParams.get('patientId'),
      doctorId: searchParams.get('doctorId'),
      status: searchParams.get('status'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy') || 'prescriptionDate',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    };

    const validation = prescriptionQuerySchema.safeParse(queryParams);
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

    const result = await pharmacyService.getPrescriptions(validation.data);

    return NextResponse.json({
      success: true,
      data: result.prescriptions,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pharmacy/prescriptions - Dispense prescription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions - only pharmacists can dispense
    if (!['admin', 'pharmacy_manager', 'pharmacist'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only pharmacists can dispense prescriptions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = dispensePrescriptionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid dispensing data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const result = await pharmacyService.dispensePrescription(
      validation.data,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Prescription dispensed successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error dispensing prescription:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes('expired') || 
        error.message.includes('cannot be dispensed') ||
        error.message.includes('Insufficient stock') ||
        error.message.includes('Cannot dispense')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to dispense prescription' },
      { status: 500 }
    );
  }
}
