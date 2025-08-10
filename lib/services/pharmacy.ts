import Medicine from '@/models/Medicine';
import Prescription from '@/models/Prescription';
import { BillingService } from './billing';
import { NotificationService } from './notification';

export class PharmacyService {
  private billingService: BillingService;
  private notificationService: NotificationService;

  constructor() {
    this.billingService = new BillingService();
    this.notificationService = new NotificationService();
  }

  // ==================== MEDICINE MANAGEMENT ====================

  async createMedicine(medicineData: any, userId: string) {
    try {
      const medicine = new Medicine({
        ...medicineData,
        createdBy: userId,
        lastUpdatedBy: userId
      });

      await medicine.save();

      // Log audit trail
      await this.logAuditTrail({
        action: 'CREATE_MEDICINE',
        entityType: 'MEDICINE',
        entityId: medicine._id.toString(),
        userId,
        details: {
          medicineName: medicine.medicineName,
          category: medicine.category,
          manufacturer: medicine.manufacturer
        },
        riskLevel: 'LOW'
      });

      return medicine;
    } catch (error) {
      console.error('Error creating medicine:', error);
      throw new Error('Failed to create medicine');
    }
  }

  async updateMedicine(medicineId: string, updates: any, userId: string) {
    try {
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }

      // Store original values for audit
      const originalValues = {
        medicineName: medicine.medicineName,
        pricing: medicine.pricing,
        inventory: medicine.inventory
      };

      Object.assign(medicine, updates);
      medicine.lastUpdatedBy = userId;
      await medicine.save();

      // Log audit trail
      await this.logAuditTrail({
        action: 'UPDATE_MEDICINE',
        entityType: 'MEDICINE',
        entityId: medicineId,
        userId,
        details: {
          originalValues,
          updatedValues: updates
        },
        riskLevel: 'MEDIUM'
      });

      return medicine;
    } catch (error) {
      console.error('Error updating medicine:', error);
      throw new Error('Failed to update medicine');
    }
  }

  async getMedicines(queryParams: any) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        manufacturer,
        stockStatus,
        expiryStatus,
        sortBy = 'medicineName',
        sortOrder = 'asc'
      } = queryParams;

      const skip = (page - 1) * limit;
      const query: any = { isActive: true };

      // Build search query
      if (search) {
        query.$or = [
          { medicineName: { $regex: search, $options: 'i' } },
          { genericName: { $regex: search, $options: 'i' } },
          { brandName: { $regex: search, $options: 'i' } },
          { medicineId: { $regex: search, $options: 'i' } }
        ];
      }

      if (category) {
        query.category = category;
      }

      if (manufacturer) {
        query.manufacturer = { $regex: manufacturer, $options: 'i' };
      }

      // Stock status filter
      if (stockStatus) {
        switch (stockStatus) {
          case 'Out of Stock':
            query['inventory.currentStock'] = 0;
            break;
          case 'Low Stock':
            query.$expr = { $lte: ['$inventory.currentStock', '$inventory.minimumStock'] };
            break;
          case 'Overstock':
            query.$expr = { $gte: ['$inventory.currentStock', '$inventory.maximumStock'] };
            break;
          case 'In Stock':
            query.$expr = { 
              $and: [
                { $gt: ['$inventory.currentStock', '$inventory.minimumStock'] },
                { $lt: ['$inventory.currentStock', '$inventory.maximumStock'] }
              ]
            };
            break;
        }
      }

      // Expiry status filter
      if (expiryStatus) {
        const now = new Date();
        const alertDate = new Date();
        alertDate.setDate(alertDate.getDate() + 90); // 90 days from now

        switch (expiryStatus) {
          case 'Expiring Soon':
            query['batches.expiryDate'] = { $lte: alertDate, $gt: now };
            query['batches.status'] = 'Active';
            query['batches.quantity'] = { $gt: 0 };
            break;
          case 'Expired':
            query['batches.expiryDate'] = { $lte: now };
            query['batches.status'] = 'Active';
            break;
          case 'Valid':
            query['batches.expiryDate'] = { $gt: alertDate };
            query['batches.status'] = 'Active';
            break;
        }
      }

      // Sort configuration
      const sortConfig: any = {};
      sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [medicines, total] = await Promise.all([
        Medicine.find(query)
          .populate('createdBy', 'name')
          .populate('lastUpdatedBy', 'name')
          .sort(sortConfig)
          .skip(skip)
          .limit(limit)
          .lean(),
        Medicine.countDocuments(query)
      ]);

      return {
        medicines,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw new Error('Failed to fetch medicines');
    }
  }

  async getMedicineById(medicineId: string) {
    try {
      const medicine = await Medicine.findById(medicineId)
        .populate('createdBy', 'name')
        .populate('lastUpdatedBy', 'name')
        .populate('stockMovements.performedBy', 'name');

      if (!medicine) {
        throw new Error('Medicine not found');
      }

      return medicine;
    } catch (error) {
      console.error('Error fetching medicine:', error);
      throw new Error('Failed to fetch medicine');
    }
  }

  // ==================== BATCH MANAGEMENT ====================

  async addBatch(batchData: any, userId: string) {
    try {
      const { medicineId, ...batchInfo } = batchData;
      
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }

      // Check if batch already exists
      const existingBatch = medicine.batches.find(b => b.batchNo === batchInfo.batchNo);
      if (existingBatch) {
        throw new Error('Batch number already exists for this medicine');
      }

      // Add batch to medicine
      medicine.batches.push({
        ...batchInfo,
        purchaseDate: new Date(),
        status: 'Active'
      });

      // Update current stock
      medicine.inventory.currentStock += batchInfo.quantity;

      // Add stock movement
      medicine.stockMovements.push({
        movementType: 'Purchase',
        quantity: batchInfo.quantity,
        batchNo: batchInfo.batchNo,
        performedBy: userId,
        reason: 'New batch added',
        movementDate: new Date()
      });

      medicine.lastUpdatedBy = userId;
      await medicine.save();

      // Check if reorder alert should be cleared
      if (medicine.inventory.currentStock > medicine.inventory.reorderLevel) {
        await this.clearLowStockAlert(medicineId);
      }

      // Log audit trail
      await this.logAuditTrail({
        action: 'ADD_BATCH',
        entityType: 'MEDICINE',
        entityId: medicineId,
        userId,
        details: {
          batchNo: batchInfo.batchNo,
          quantity: batchInfo.quantity,
          expiryDate: batchInfo.expiryDate,
          costPrice: batchInfo.costPrice
        },
        riskLevel: 'LOW'
      });

      return medicine;
    } catch (error) {
      console.error('Error adding batch:', error);
      throw new Error(error.message || 'Failed to add batch');
    }
  }

  async updateBatch(medicineId: string, batchNo: string, updates: any, userId: string) {
    try {
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }

      const batch = medicine.batches.find(b => b.batchNo === batchNo);
      if (!batch) {
        throw new Error('Batch not found');
      }

      const originalQuantity = batch.quantity;
      Object.assign(batch, updates);

      // Update current stock if quantity changed
      if (updates.quantity !== undefined) {
        const quantityDifference = updates.quantity - originalQuantity;
        medicine.inventory.currentStock += quantityDifference;

        // Add stock movement for adjustment
        if (quantityDifference !== 0) {
          medicine.stockMovements.push({
            movementType: 'Adjustment',
            quantity: quantityDifference,
            batchNo: batchNo,
            performedBy: userId,
            reason: 'Batch quantity adjustment',
            movementDate: new Date()
          });
        }
      }

      medicine.lastUpdatedBy = userId;
      await medicine.save();

      // Log audit trail
      await this.logAuditTrail({
        action: 'UPDATE_BATCH',
        entityType: 'MEDICINE',
        entityId: medicineId,
        userId,
        details: {
          batchNo,
          updates,
          originalQuantity,
          newQuantity: batch.quantity
        },
        riskLevel: 'MEDIUM'
      });

      return medicine;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw new Error(error.message || 'Failed to update batch');
    }
  }

  // ==================== STOCK MANAGEMENT ====================

  async recordStockMovement(movementData: any, userId: string) {
    try {
      const { medicineId, movementType, quantity, batchNo, reason, referenceId, notes } = movementData;

      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }

      // Validate batch if specified
      if (batchNo) {
        const batch = medicine.batches.find(b => b.batchNo === batchNo);
        if (!batch) {
          throw new Error('Batch not found');
        }

        // For outgoing movements, check if sufficient stock exists
        if (['Sale', 'Transfer', 'Expired', 'Damaged'].includes(movementType)) {
          if (batch.quantity < quantity) {
            throw new Error('Insufficient stock in the specified batch');
          }
          batch.quantity -= quantity;
          medicine.inventory.currentStock -= quantity;
        } else {
          // For incoming movements
          batch.quantity += quantity;
          medicine.inventory.currentStock += quantity;
        }
      } else {
        // For movements without specific batch
        if (['Sale', 'Transfer', 'Expired', 'Damaged'].includes(movementType)) {
          if (medicine.inventory.currentStock < quantity) {
            throw new Error('Insufficient stock');
          }
          medicine.inventory.currentStock -= quantity;
        } else {
          medicine.inventory.currentStock += quantity;
        }
      }

      // Add stock movement record
      medicine.stockMovements.push({
        movementType,
        quantity: ['Sale', 'Transfer', 'Expired', 'Damaged'].includes(movementType) ? -quantity : quantity,
        batchNo,
        reason,
        referenceId,
        notes,
        performedBy: userId,
        movementDate: new Date()
      });

      medicine.lastUpdatedBy = userId;
      await medicine.save();

      // Check for stock alerts
      await this.checkStockAlerts(medicine);

      // Log audit trail
      await this.logAuditTrail({
        action: 'STOCK_MOVEMENT',
        entityType: 'MEDICINE',
        entityId: medicineId,
        userId,
        details: {
          movementType,
          quantity,
          batchNo,
          reason,
          currentStock: medicine.inventory.currentStock
        },
        riskLevel: movementType === 'Sale' ? 'LOW' : 'MEDIUM'
      });

      return medicine;
    } catch (error) {
      console.error('Error recording stock movement:', error);
      throw new Error(error.message || 'Failed to record stock movement');
    }
  }

  async getStockMovements(queryParams: any) {
    try {
      const {
        page = 1,
        limit = 20,
        medicineId,
        movementType,
        dateFrom,
        dateTo,
        performedBy,
        sortBy = 'movementDate',
        sortOrder = 'desc'
      } = queryParams;

      const skip = (page - 1) * limit;
      const matchQuery: any = {};

      if (medicineId) {
        matchQuery._id = medicineId;
      }

      const pipeline: any[] = [
        { $match: matchQuery },
        { $unwind: '$stockMovements' },
        {
          $lookup: {
            from: 'users',
            localField: 'stockMovements.performedBy',
            foreignField: '_id',
            as: 'stockMovements.performedByUser'
          }
        },
        {
          $addFields: {
            'stockMovements.performedByUser': { $arrayElemAt: ['$stockMovements.performedByUser', 0] }
          }
        }
      ];

      // Add filters
      const movementMatch: any = {};
      
      if (movementType) {
        movementMatch['stockMovements.movementType'] = movementType;
      }

      if (dateFrom || dateTo) {
        movementMatch['stockMovements.movementDate'] = {};
        if (dateFrom) {
          movementMatch['stockMovements.movementDate'].$gte = new Date(dateFrom);
        }
        if (dateTo) {
          movementMatch['stockMovements.movementDate'].$lte = new Date(dateTo);
        }
      }

      if (performedBy) {
        movementMatch['stockMovements.performedBy'] = performedBy;
      }

      if (Object.keys(movementMatch).length > 0) {
        pipeline.push({ $match: movementMatch });
      }

      // Sort
      const sortConfig: any = {};
      sortConfig[`stockMovements.${sortBy}`] = sortOrder === 'desc' ? -1 : 1;
      pipeline.push({ $sort: sortConfig });

      // Pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      // Project final structure
      pipeline.push({
        $project: {
          medicineId: '$medicineId',
          medicineName: '$medicineName',
          movement: '$stockMovements'
        }
      });

      const movements = await Medicine.aggregate(pipeline);

      // Get total count
      const countPipeline = [...pipeline.slice(0, -3)]; // Remove sort, skip, limit, project
      countPipeline.push({ $count: 'total' });
      const countResult = await Medicine.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      return {
        movements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw new Error('Failed to fetch stock movements');
    }
  }

  // ==================== HELPER METHODS ====================

  private async checkStockAlerts(medicine: any) {
    try {
      // Check low stock alert
      if (medicine.inventory.currentStock <= medicine.inventory.reorderLevel) {
        await this.sendLowStockAlert(medicine);
      }

      // Check expiry alerts
      const expiringBatches = medicine.expiringBatches;
      if (expiringBatches.length > 0) {
        await this.sendExpiryAlert(medicine, expiringBatches);
      }
    } catch (error) {
      console.error('Error checking stock alerts:', error);
    }
  }

  private async sendLowStockAlert(medicine: any) {
    try {
      if (!medicine.alerts.lowStockAlert) return;

      const alertData = {
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: `${medicine.medicineName} is running low. Current stock: ${medicine.inventory.currentStock}, Minimum required: ${medicine.inventory.minimumStock}`,
        priority: 'HIGH',
        data: {
          medicineId: medicine._id,
          medicineName: medicine.medicineName,
          currentStock: medicine.inventory.currentStock,
          minimumStock: medicine.inventory.minimumStock,
          reorderLevel: medicine.inventory.reorderLevel
        }
      };

      await this.notificationService.sendAlert(alertData);
    } catch (error) {
      console.error('Error sending low stock alert:', error);
    }
  }

  private async sendExpiryAlert(medicine: any, expiringBatches: any[]) {
    try {
      if (!medicine.alerts.expiryAlert) return;

      const alertData = {
        type: 'EXPIRY_ALERT',
        title: 'Medicine Expiry Alert',
        message: `${medicine.medicineName} has ${expiringBatches.length} batch(es) expiring soon`,
        priority: 'MEDIUM',
        data: {
          medicineId: medicine._id,
          medicineName: medicine.medicineName,
          expiringBatches: expiringBatches.map(batch => ({
            batchNo: batch.batchNo,
            expiryDate: batch.expiryDate,
            quantity: batch.quantity
          }))
        }
      };

      await this.notificationService.sendAlert(alertData);
    } catch (error) {
      console.error('Error sending expiry alert:', error);
    }
  }

  private async clearLowStockAlert(medicineId: string) {
    try {
      // Implementation to clear/mark resolved low stock alerts
      // This would integrate with your notification system
    } catch (error) {
      console.error('Error clearing low stock alert:', error);
    }
  }

  private async logAuditTrail(auditData: any) {
    try {
      // Implementation for audit logging
      // This would integrate with your audit system
      console.log('Audit Trail:', auditData);
    } catch (error) {
      console.error('Error logging audit trail:', error);
    }
  }
}
