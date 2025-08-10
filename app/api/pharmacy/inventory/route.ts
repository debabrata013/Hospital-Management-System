import { NextRequest, NextResponse } from 'next/server';
import { PharmacyService } from '@/lib/services/pharmacy';
import { 
  addBatchSchema, 
  updateBatchSchema,
  stockMovementSchema,
  stockMovementQuerySchema,
  inventoryReportSchema
} from '@/lib/validations/pharmacy';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const pharmacyService = new PharmacyService();

// GET /api/pharmacy/inventory - Get inventory reports and stock movements
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
    const reportType = searchParams.get('reportType');

    if (reportType) {
      // Generate inventory report
      const reportParams = {
        reportType,
        dateFrom: searchParams.get('dateFrom'),
        dateTo: searchParams.get('dateTo'),
        category: searchParams.get('category'),
        manufacturer: searchParams.get('manufacturer'),
        includeInactive: searchParams.get('includeInactive') === 'true',
        groupBy: searchParams.get('groupBy')
      };

      const validation = inventoryReportSchema.safeParse(reportParams);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid report parameters',
            details: validation.error.errors 
          },
          { status: 400 }
        );
      }

      const report = await pharmacyService.generateInventoryReport(validation.data);

      return NextResponse.json({
        success: true,
        data: report
      });
    } else {
      // Get stock movements
      const queryParams = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
        medicineId: searchParams.get('medicineId'),
        movementType: searchParams.get('movementType'),
        dateFrom: searchParams.get('dateFrom'),
        dateTo: searchParams.get('dateTo'),
        performedBy: searchParams.get('performedBy'),
        sortBy: searchParams.get('sortBy') || 'movementDate',
        sortOrder: searchParams.get('sortOrder') || 'desc'
      };

      const validation = stockMovementQuerySchema.safeParse(queryParams);
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

      const result = await pharmacyService.getStockMovements(validation.data);

      return NextResponse.json({
        success: true,
        data: result.movements,
        pagination: result.pagination
      });
    }

  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pharmacy/inventory - Add batch or record stock movement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'pharmacy_manager', 'pharmacist', 'inventory_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'add_batch') {
      // Add new batch
      const validation = addBatchSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid batch data',
            details: validation.error.errors 
          },
          { status: 400 }
        );
      }

      const medicine = await pharmacyService.addBatch(validation.data, session.user.id);

      return NextResponse.json({
        success: true,
        data: medicine,
        message: 'Batch added successfully'
      }, { status: 201 });

    } else if (action === 'stock_movement') {
      // Record stock movement
      const validation = stockMovementSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid stock movement data',
            details: validation.error.errors 
          },
          { status: 400 }
        );
      }

      const medicine = await pharmacyService.recordStockMovement(validation.data, session.user.id);

      return NextResponse.json({
        success: true,
        data: medicine,
        message: 'Stock movement recorded successfully'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action specified' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing inventory operation:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error.message.includes('Insufficient stock') || error.message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process inventory operation' },
      { status: 500 }
    );
  }
}

// PUT /api/pharmacy/inventory - Update batch information
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'pharmacy_manager', 'inventory_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateBatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid batch update data',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const medicine = await pharmacyService.updateBatch(
      validation.data.medicineId,
      validation.data.batchNo,
      validation.data.updates,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: medicine,
      message: 'Batch updated successfully'
    });

  } catch (error) {
    console.error('Error updating batch:', error);
    
    if (error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update batch' },
      { status: 500 }
    );
  }
}
