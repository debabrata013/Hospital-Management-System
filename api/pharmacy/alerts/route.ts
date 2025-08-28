import { NextRequest, NextResponse } from 'next/server';
import Medicine from '@/models/Medicine';
import { getServerSession } from '@/lib/auth';

// GET /api/pharmacy/alerts - Get stock alerts and notifications
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
    const alertType = searchParams.get('alertType') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    const alerts = {
      lowStock: [],
      outOfStock: [],
      expiringSoon: [],
      expired: [],
      overstock: []
    };

    // Get low stock medicines
    if (alertType === 'all' || alertType === 'low_stock') {
      alerts.lowStock = await Medicine.find({
        isActive: true,
        $expr: { 
          $and: [
            { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] },
            { $gt: ['$inventory.currentStock', 0] }
          ]
        }
      })
      .select('medicineId medicineName category inventory vendor.name')
      .limit(limit)
      .lean();
    }

    // Get out of stock medicines
    if (alertType === 'all' || alertType === 'out_of_stock') {
      alerts.outOfStock = await Medicine.find({
        isActive: true,
        'inventory.currentStock': 0
      })
      .select('medicineId medicineName category inventory vendor.name')
      .limit(limit)
      .lean();
    }

    // Get expiring medicines (within 90 days)
    if (alertType === 'all' || alertType === 'expiring_soon') {
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() + 90);

      const expiringMedicines = await Medicine.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$batches' },
        {
          $match: {
            'batches.expiryDate': { $lte: alertDate, $gt: new Date() },
            'batches.status': 'Active',
            'batches.quantity': { $gt: 0 }
          }
        },
        {
          $project: {
            medicineId: 1,
            medicineName: 1,
            category: 1,
            batchNo: '$batches.batchNo',
            expiryDate: '$batches.expiryDate',
            quantity: '$batches.quantity',
            daysToExpiry: {
              $divide: [
                { $subtract: ['$batches.expiryDate', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        { $sort: { expiryDate: 1 } },
        { $limit: limit }
      ]);

      alerts.expiringSoon = expiringMedicines;
    }

    // Get expired medicines
    if (alertType === 'all' || alertType === 'expired') {
      const expiredMedicines = await Medicine.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$batches' },
        {
          $match: {
            'batches.expiryDate': { $lte: new Date() },
            'batches.status': 'Active',
            'batches.quantity': { $gt: 0 }
          }
        },
        {
          $project: {
            medicineId: 1,
            medicineName: 1,
            category: 1,
            batchNo: '$batches.batchNo',
            expiryDate: '$batches.expiryDate',
            quantity: '$batches.quantity',
            daysExpired: {
              $divide: [
                { $subtract: [new Date(), '$batches.expiryDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        { $sort: { expiryDate: -1 } },
        { $limit: limit }
      ]);

      alerts.expired = expiredMedicines;
    }

    // Get overstock medicines
    if (alertType === 'all' || alertType === 'overstock') {
      alerts.overstock = await Medicine.find({
        isActive: true,
        $expr: { $gte: ['$inventory.currentStock', '$inventory.maximumStock'] }
      })
      .select('medicineId medicineName category inventory')
      .limit(limit)
      .lean();
    }

    // Calculate summary statistics
    const summary = {
      lowStockCount: alerts.lowStock.length,
      outOfStockCount: alerts.outOfStock.length,
      expiringSoonCount: alerts.expiringSoon.length,
      expiredCount: alerts.expired.length,
      overstockCount: alerts.overstock.length,
      totalAlerts: alerts.lowStock.length + alerts.outOfStock.length + 
                   alerts.expiringSoon.length + alerts.expired.length + alerts.overstock.length
    };

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pharmacy/alerts - Send alert notifications or update alert settings
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
    if (!['admin', 'pharmacy_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, medicineIds, alertType, recipients } = body;

    if (action === 'send_notifications') {
      // Send alert notifications
      if (!medicineIds || !Array.isArray(medicineIds) || medicineIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Medicine IDs are required' },
          { status: 400 }
        );
      }

      // Mock notification sending
      const notificationResults = {
        sent: medicineIds.length,
        failed: 0,
        recipients: recipients || ['pharmacy@hospital.com'],
        alertType: alertType || 'general'
      };

      return NextResponse.json({
        success: true,
        data: notificationResults,
        message: `Notifications sent successfully for ${medicineIds.length} medicines`
      });

    } else if (action === 'update_alert_settings') {
      // Update alert settings for medicines
      const { settings } = body;
      
      if (!settings) {
        return NextResponse.json(
          { success: false, error: 'Alert settings are required' },
          { status: 400 }
        );
      }

      // Update alert settings for specified medicines
      const updateResult = await Medicine.updateMany(
        { _id: { $in: medicineIds } },
        { 
          $set: {
            'alerts.lowStockAlert': settings.lowStockAlert,
            'alerts.expiryAlert': settings.expiryAlert,
            'alerts.expiryAlertDays': settings.expiryAlertDays,
            lastUpdatedBy: session.user.id,
            lastUpdated: Date.now()
          }
        }
      );

      return NextResponse.json({
        success: true,
        data: {
          modifiedCount: updateResult.modifiedCount,
          matchedCount: updateResult.matchedCount
        },
        message: 'Alert settings updated successfully'
      });

    } else if (action === 'mark_resolved') {
      // Mark alerts as resolved (for tracking purposes)
      const resolvedAlerts = {
        alertType,
        medicineIds,
        resolvedBy: session.user.id,
        resolvedAt: new Date(),
        count: medicineIds?.length || 0
      };

      return NextResponse.json({
        success: true,
        data: resolvedAlerts,
        message: 'Alerts marked as resolved'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action specified' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing alert action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process alert action' },
      { status: 500 }
    );
  }
}

// PUT /api/pharmacy/alerts - Update global alert configuration
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can update global alert configuration
    if (!['admin', 'pharmacy_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      lowStockThreshold, 
      expiryAlertDays, 
      enableEmailAlerts, 
      enableSMSAlerts,
      alertRecipients 
    } = body;

    // Mock global alert configuration update
    const globalConfig = {
      lowStockThreshold: lowStockThreshold || 10,
      expiryAlertDays: expiryAlertDays || 90,
      enableEmailAlerts: enableEmailAlerts !== undefined ? enableEmailAlerts : true,
      enableSMSAlerts: enableSMSAlerts !== undefined ? enableSMSAlerts : false,
      alertRecipients: alertRecipients || [],
      updatedBy: session.user.id,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: globalConfig,
      message: 'Global alert configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating alert configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update alert configuration' },
      { status: 500 }
    );
  }
}
