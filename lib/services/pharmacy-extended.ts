import Medicine from '@/models/Medicine';
import Prescription from '@/models/Prescription';
import { PharmacyService } from './pharmacy';

export class PharmacyExtendedService extends PharmacyService {

  // ==================== PRESCRIPTION PROCESSING ====================

  async dispensePrescription(dispensingData: any, pharmacistId: string) {
    try {
      const { prescriptionId, medications, paymentMethod, customerPaid, notes } = dispensingData;

      // Get prescription
      const prescription = await Prescription.findById(prescriptionId)
        .populate('patientId', 'name patientId contactNumber')
        .populate('doctorId', 'name specialization');

      if (!prescription) {
        throw new Error('Prescription not found');
      }

      if (prescription.status === 'Completed' || prescription.status === 'Cancelled') {
        throw new Error('Prescription cannot be dispensed');
      }

      if (prescription.isExpired) {
        throw new Error('Prescription has expired');
      }

      let totalAmount = 0;
      const dispensedItems = [];
      const stockUpdates = [];

      // Process each medication
      for (const medData of medications) {
        const { medicationIndex, medicineId, batchNo, quantityDispensed, sellingPrice, discount } = medData;

        // Validate medication exists in prescription
        if (medicationIndex >= prescription.medications.length) {
          throw new Error(`Invalid medication index: ${medicationIndex}`);
        }

        const prescribedMed = prescription.medications[medicationIndex];
        
        // Check if quantity doesn't exceed prescribed amount
        const alreadyDispensed = prescribedMed.dispensed.quantity || 0;
        const remainingQuantity = prescribedMed.quantity - alreadyDispensed;
        
        if (quantityDispensed > remainingQuantity) {
          throw new Error(`Cannot dispense ${quantityDispensed} of ${prescribedMed.medicineName}. Only ${remainingQuantity} remaining.`);
        }

        // Get medicine and validate batch
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) {
          throw new Error(`Medicine not found: ${medicineId}`);
        }

        const batch = medicine.batches.find(b => b.batchNo === batchNo && b.status === 'Active');
        if (!batch) {
          throw new Error(`Batch not found or inactive: ${batchNo}`);
        }

        if (batch.quantity < quantityDispensed) {
          throw new Error(`Insufficient stock in batch ${batchNo}. Available: ${batch.quantity}, Required: ${quantityDispensed}`);
        }

        // Check expiry
        if (new Date(batch.expiryDate) <= new Date()) {
          throw new Error(`Batch ${batchNo} has expired`);
        }

        // Calculate amount
        const discountAmount = (sellingPrice * quantityDispensed * discount) / 100;
        const itemTotal = (sellingPrice * quantityDispensed) - discountAmount;
        totalAmount += itemTotal;

        // Prepare stock update
        stockUpdates.push({
          medicine,
          batch,
          quantityDispensed,
          medicationIndex,
          itemTotal,
          sellingPrice,
          discount
        });

        dispensedItems.push({
          medicineName: medicine.medicineName,
          batchNo,
          quantityDispensed,
          sellingPrice,
          discount,
          itemTotal
        });
      }

      // Validate payment
      if (customerPaid < totalAmount) {
        throw new Error(`Insufficient payment. Required: ₹${totalAmount}, Paid: ₹${customerPaid}`);
      }

      // Process stock updates
      for (const update of stockUpdates) {
        const { medicine, batch, quantityDispensed, medicationIndex } = update;

        // Update batch quantity
        batch.quantity -= quantityDispensed;
        medicine.inventory.currentStock -= quantityDispensed;

        // Add stock movement
        medicine.stockMovements.push({
          movementType: 'Sale',
          quantity: -quantityDispensed,
          batchNo: batch.batchNo,
          performedBy: pharmacistId,
          referenceId: prescriptionId,
          reason: 'Prescription dispensing',
          movementDate: new Date()
        });

        // Update prescription medication
        const prescribedMed = prescription.medications[medicationIndex];
        prescribedMed.dispensed.quantity += quantityDispensed;
        prescribedMed.dispensed.dates.push(new Date());
        prescribedMed.dispensed.pharmacist = pharmacistId;

        await medicine.save();

        // Check stock alerts
        await this.checkStockAlerts(medicine);
      }

      // Update prescription status
      const allMedicationsDispensed = prescription.medications.every(med => 
        med.dispensed.quantity >= med.quantity
      );
      const anyMedicationDispensed = prescription.medications.some(med => 
        med.dispensed.quantity > 0
      );

      if (allMedicationsDispensed) {
        prescription.status = 'Completed';
      } else if (anyMedicationDispensed) {
        prescription.status = 'Partially Filled';
      }

      // Add audit entry
      prescription.auditTrail.push({
        action: 'Dispensed',
        performedBy: pharmacistId,
        details: `Dispensed ${medications.length} medication(s). Total: ₹${totalAmount}`,
        timestamp: new Date()
      });

      if (notes) {
        prescription.pharmacistNotes = notes;
      }

      await prescription.save();

      // Create billing entry
      const billingData = {
        patientId: prescription.patientId._id,
        prescriptionId: prescriptionId,
        items: dispensedItems.map(item => ({
          description: `${item.medicineName} (Batch: ${item.batchNo})`,
          quantity: item.quantityDispensed,
          unitPrice: item.sellingPrice,
          discount: item.discount,
          total: item.itemTotal,
          department: 'Pharmacy'
        })),
        totalAmount,
        paidAmount: customerPaid,
        paymentMethod,
        status: customerPaid >= totalAmount ? 'paid' : 'partial',
        dueDate: new Date(),
        notes: `Prescription dispensing - ${prescriptionId}`
      };

      const invoice = await this.billingService.createInvoice(billingData);

      // Process payment if amount paid
      if (customerPaid > 0) {
        await this.billingService.processPayment({
          invoiceId: invoice._id,
          amount: customerPaid,
          paymentMethod,
          processedBy: pharmacistId,
          notes: 'Prescription payment'
        });
      }

      // Log audit trail
      await this.logAuditTrail({
        action: 'DISPENSE_PRESCRIPTION',
        entityType: 'PRESCRIPTION',
        entityId: prescriptionId,
        userId: pharmacistId,
        details: {
          totalAmount,
          customerPaid,
          itemsDispensed: dispensedItems.length,
          invoiceId: invoice._id
        },
        riskLevel: 'MEDIUM'
      });

      return {
        prescription,
        invoice,
        dispensedItems,
        totalAmount,
        changeAmount: customerPaid - totalAmount,
        dispensedBy: pharmacistId,
        dispensedAt: new Date()
      };

    } catch (error) {
      console.error('Error dispensing prescription:', error);
      throw new Error(error.message || 'Failed to dispense prescription');
    }
  }

  async getPrescriptions(queryParams: any) {
    try {
      const {
        page = 1,
        limit = 20,
        patientId,
        doctorId,
        status,
        dateFrom,
        dateTo,
        search,
        sortBy = 'prescriptionDate',
        sortOrder = 'desc'
      } = queryParams;

      const skip = (page - 1) * limit;
      const query: any = {};

      if (patientId) query.patientId = patientId;
      if (doctorId) query.doctorId = doctorId;
      if (status) query.status = status;

      if (dateFrom || dateTo) {
        query.prescriptionDate = {};
        if (dateFrom) query.prescriptionDate.$gte = new Date(dateFrom);
        if (dateTo) query.prescriptionDate.$lte = new Date(dateTo);
      }

      if (search) {
        query.$or = [
          { prescriptionId: { $regex: search, $options: 'i' } },
          { 'medications.medicineName': { $regex: search, $options: 'i' } }
        ];
      }

      const sortConfig: any = {};
      sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [prescriptions, total] = await Promise.all([
        Prescription.find(query)
          .populate('patientId', 'name patientId age gender contactNumber')
          .populate('doctorId', 'name specialization')
          .sort(sortConfig)
          .skip(skip)
          .limit(limit)
          .lean(),
        Prescription.countDocuments(query)
      ]);

      return {
        prescriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw new Error('Failed to fetch prescriptions');
    }
  }

  async getPrescriptionById(prescriptionId: string) {
    try {
      const prescription = await Prescription.findById(prescriptionId)
        .populate('patientId', 'name patientId age gender contactNumber address')
        .populate('doctorId', 'name specialization contactNumber')
        .populate('auditTrail.performedBy', 'name');

      if (!prescription) {
        throw new Error('Prescription not found');
      }

      // Get medicine details for each medication
      const medicationsWithDetails = await Promise.all(
        prescription.medications.map(async (med) => {
          if (med.medicineId) {
            const medicine = await Medicine.findById(med.medicineId)
              .select('medicineName genericName strength dosageForm pricing batches inventory');
            return {
              ...med.toObject(),
              medicineDetails: medicine
            };
          }
          return med.toObject();
        })
      );

      return {
        ...prescription.toObject(),
        medications: medicationsWithDetails
      };
    } catch (error) {
      console.error('Error fetching prescription:', error);
      throw new Error('Failed to fetch prescription');
    }
  }

  // ==================== VENDOR MANAGEMENT ====================

  async createVendor(vendorData: any, userId: string) {
    try {
      // Create vendor model (you'll need to create this model)
      const vendor = {
        vendorId: this.generateVendorId(),
        ...vendorData,
        createdBy: userId,
        createdAt: new Date(),
        lastUpdatedBy: userId,
        lastUpdated: Date.now()
      };

      // Save vendor (implement based on your vendor model)
      // const savedVendor = await Vendor.create(vendor);

      // Log audit trail
      await this.logAuditTrail({
        action: 'CREATE_VENDOR',
        entityType: 'VENDOR',
        entityId: vendor.vendorId,
        userId,
        details: {
          vendorName: vendor.name,
          businessType: vendor.businessDetails?.businessType,
          contactNumber: vendor.contactNumber
        },
        riskLevel: 'LOW'
      });

      return vendor;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw new Error('Failed to create vendor');
    }
  }

  async createPurchaseOrder(orderData: any, userId: string) {
    try {
      const { vendorId, items, expectedDeliveryDate, shippingAddress, notes, urgency } = orderData;

      // Calculate totals
      let subtotal = 0;
      let totalGST = 0;
      let totalDiscount = 0;

      const processedItems = await Promise.all(
        items.map(async (item) => {
          const medicine = await Medicine.findById(item.medicineId);
          if (!medicine) {
            throw new Error(`Medicine not found: ${item.medicineId}`);
          }

          const itemSubtotal = item.quantity * item.unitPrice;
          const itemDiscount = (itemSubtotal * item.discount) / 100;
          const itemAfterDiscount = itemSubtotal - itemDiscount;
          const itemGST = (itemAfterDiscount * item.gstRate) / 100;
          const itemTotal = itemAfterDiscount + itemGST;

          subtotal += itemSubtotal;
          totalDiscount += itemDiscount;
          totalGST += itemGST;

          return {
            ...item,
            medicineName: medicine.medicineName,
            itemSubtotal,
            itemDiscount,
            itemGST,
            itemTotal
          };
        })
      );

      const totalAmount = subtotal - totalDiscount + totalGST;

      const purchaseOrder = {
        purchaseOrderId: this.generatePurchaseOrderId(),
        vendorId,
        orderDate: new Date(),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        items: processedItems,
        subtotal,
        totalDiscount,
        totalGST,
        totalAmount,
        shippingAddress,
        notes,
        urgency,
        status: 'Draft',
        createdBy: userId,
        createdAt: new Date(),
        lastUpdatedBy: userId,
        lastUpdated: Date.now()
      };

      // Save purchase order (implement based on your PurchaseOrder model)
      // const savedOrder = await PurchaseOrder.create(purchaseOrder);

      // Log audit trail
      await this.logAuditTrail({
        action: 'CREATE_PURCHASE_ORDER',
        entityType: 'PURCHASE_ORDER',
        entityId: purchaseOrder.purchaseOrderId,
        userId,
        details: {
          vendorId,
          totalAmount,
          itemCount: items.length,
          urgency
        },
        riskLevel: 'MEDIUM'
      });

      return purchaseOrder;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw new Error(error.message || 'Failed to create purchase order');
    }
  }

  // ==================== REPORTING ====================

  async generateInventoryReport(reportParams: any) {
    try {
      const { reportType, dateFrom, dateTo, category, manufacturer, includeInactive, groupBy } = reportParams;

      let pipeline: any[] = [];
      const matchStage: any = {};

      if (!includeInactive) {
        matchStage.isActive = true;
      }

      if (category) {
        matchStage.category = category;
      }

      if (manufacturer) {
        matchStage.manufacturer = { $regex: manufacturer, $options: 'i' };
      }

      pipeline.push({ $match: matchStage });

      switch (reportType) {
        case 'stock_summary':
          pipeline.push({
            $group: {
              _id: groupBy ? `$${groupBy}` : null,
              totalMedicines: { $sum: 1 },
              totalStock: { $sum: '$inventory.currentStock' },
              totalValue: { $sum: { $multiply: ['$inventory.currentStock', '$pricing.costPrice'] } },
              lowStockCount: {
                $sum: {
                  $cond: [
                    { $lte: ['$inventory.currentStock', '$inventory.minimumStock'] },
                    1,
                    0
                  ]
                }
              },
              outOfStockCount: {
                $sum: {
                  $cond: [
                    { $eq: ['$inventory.currentStock', 0] },
                    1,
                    0
                  ]
                }
              }
            }
          });
          break;

        case 'low_stock':
          pipeline.push({
            $match: {
              $expr: { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] }
            }
          });
          pipeline.push({
            $project: {
              medicineId: 1,
              medicineName: 1,
              category: 1,
              currentStock: '$inventory.currentStock',
              minimumStock: '$inventory.minimumStock',
              reorderLevel: '$inventory.reorderLevel',
              reorderQuantity: '$inventory.reorderQuantity',
              vendor: '$vendor.name',
              stockStatus: {
                $cond: [
                  { $eq: ['$inventory.currentStock', 0] },
                  'Out of Stock',
                  'Low Stock'
                ]
              }
            }
          });
          break;

        case 'expiring_medicines':
          const alertDate = new Date();
          alertDate.setDate(alertDate.getDate() + 90);
          
          pipeline.push({ $unwind: '$batches' });
          pipeline.push({
            $match: {
              'batches.expiryDate': { $lte: alertDate },
              'batches.status': 'Active',
              'batches.quantity': { $gt: 0 }
            }
          });
          pipeline.push({
            $project: {
              medicineId: 1,
              medicineName: 1,
              category: 1,
              batchNo: '$batches.batchNo',
              expiryDate: '$batches.expiryDate',
              quantity: '$batches.quantity',
              costPrice: '$batches.costPrice',
              totalValue: { $multiply: ['$batches.quantity', '$batches.costPrice'] },
              daysToExpiry: {
                $divide: [
                  { $subtract: ['$batches.expiryDate', new Date()] },
                  1000 * 60 * 60 * 24
                ]
              }
            }
          });
          pipeline.push({ $sort: { expiryDate: 1 } });
          break;

        case 'stock_valuation':
          pipeline.push({
            $project: {
              medicineId: 1,
              medicineName: 1,
              category: 1,
              manufacturer: 1,
              currentStock: '$inventory.currentStock',
              costPrice: '$pricing.costPrice',
              sellingPrice: '$pricing.sellingPrice',
              stockValue: { $multiply: ['$inventory.currentStock', '$pricing.costPrice'] },
              potentialRevenue: { $multiply: ['$inventory.currentStock', '$pricing.sellingPrice'] },
              potentialProfit: {
                $multiply: [
                  '$inventory.currentStock',
                  { $subtract: ['$pricing.sellingPrice', '$pricing.costPrice'] }
                ]
              }
            }
          });
          
          if (groupBy) {
            pipeline.push({
              $group: {
                _id: `$${groupBy}`,
                totalMedicines: { $sum: 1 },
                totalStockValue: { $sum: '$stockValue' },
                totalPotentialRevenue: { $sum: '$potentialRevenue' },
                totalPotentialProfit: { $sum: '$potentialProfit' }
              }
            });
          }
          break;
      }

      const result = await Medicine.aggregate(pipeline);

      return {
        reportType,
        generatedAt: new Date(),
        parameters: reportParams,
        data: result
      };
    } catch (error) {
      console.error('Error generating inventory report:', error);
      throw new Error('Failed to generate inventory report');
    }
  }

  // ==================== HELPER METHODS ====================

  private generateVendorId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `VEN${timestamp}${random}`;
  }

  private generatePurchaseOrderId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `PO${timestamp}${random}`;
  }
}
