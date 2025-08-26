import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/mysql-connection';

// POST /api/pharmacy/prescriptions/[id]/dispense - Dispense medications
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = params.id;
    const { 
      medications, 
      pharmacist_id, 
      patient_signature, 
      notes 
    } = await request.json();

    // Validate input
    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No medications provided for dispensing' },
        { status: 400 }
      );
    }

    if (!pharmacist_id) {
      return NextResponse.json(
        { success: false, error: 'Pharmacist ID is required' },
        { status: 400 }
      );
    }

    // Get prescription details
    const prescriptionQuery = `
      SELECT id, prescription_id, status 
      FROM prescriptions 
      WHERE id = ? OR prescription_id = ?
    `;
    
    const prescriptionResult = await executeQuery(prescriptionQuery, [prescriptionId, prescriptionId]);
    
    if (prescriptionResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    const prescription = prescriptionResult[0];

    if (prescription.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Prescription is not active' },
        { status: 400 }
      );
    }

    // Prepare transaction queries
    const transactionQueries = [];
    let totalDispensedAmount = 0;

    for (const med of medications) {
      const { 
        medication_id, 
        quantity_to_dispense, 
        batch_number, 
        expiry_date, 
        unit_price,
        is_full_dispense = false 
      } = med;

      // Validate medication exists and get current details
      const medicationQuery = `
        SELECT 
          pm.id, pm.quantity, pm.dispensed_quantity, pm.unit_price as original_price,
          pm.medicine_id, pm.medicine_name,
          m.current_stock
        FROM prescription_medications pm
        JOIN medicines m ON pm.medicine_id = m.id
        WHERE pm.id = ? AND pm.prescription_id = ?
      `;

      const medicationResult = await executeQuery(medicationQuery, [medication_id, prescription.id]);

      if (medicationResult.length === 0) {
        return NextResponse.json(
          { success: false, error: `Medication with ID ${medication_id} not found in prescription` },
          { status: 400 }
        );
      }

      const medication = medicationResult[0];
      const remainingQuantity = medication.quantity - medication.dispensed_quantity;

      if (quantity_to_dispense > remainingQuantity) {
        return NextResponse.json(
          { success: false, error: `Cannot dispense ${quantity_to_dispense} of ${medication.medicine_name}. Only ${remainingQuantity} remaining.` },
          { status: 400 }
        );
      }

      if (quantity_to_dispense > medication.current_stock) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${medication.medicine_name}. Available: ${medication.current_stock}` },
          { status: 400 }
        );
      }

      const newDispensedQuantity = medication.dispensed_quantity + quantity_to_dispense;
      const isFullyDispensed = is_full_dispense || (newDispensedQuantity >= medication.quantity);
      const finalUnitPrice = unit_price || medication.original_price;
      const totalPrice = quantity_to_dispense * finalUnitPrice;
      
      totalDispensedAmount += totalPrice;

      // Update prescription medication
      transactionQueries.push({
        query: `
          UPDATE prescription_medications 
          SET 
            dispensed_quantity = ?,
            is_dispensed = ?,
            dispensed_by = ?,
            dispensed_at = NOW(),
            batch_number = ?,
            expiry_date = ?,
            unit_price = ?,
            updated_at = NOW()
          WHERE id = ?
        `,
        params: [
          newDispensedQuantity,
          isFullyDispensed,
          pharmacist_id,
          batch_number,
          expiry_date,
          finalUnitPrice,
          medication_id
        ]
      });

      // Update medicine stock
      transactionQueries.push({
        query: `
          UPDATE medicines 
          SET current_stock = current_stock - ?, updated_at = NOW()
          WHERE id = ?
        `,
        params: [quantity_to_dispense, medication.medicine_id]
      });

      // Create stock transaction
      const transactionId = `TXN${Date.now()}_${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
      transactionQueries.push({
        query: `
          INSERT INTO medicine_stock_transactions (
            transaction_id, medicine_id, transaction_type, quantity, 
            unit_price, total_amount, batch_number, expiry_date,
            reference_number, notes, created_by
          ) VALUES (?, ?, 'OUT', ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          transactionId,
          medication.medicine_id,
          quantity_to_dispense,
          finalUnitPrice,
          totalPrice,
          batch_number,
          expiry_date,
          prescription.prescription_id,
          `Dispensed for prescription ${prescription.prescription_id}`,
          pharmacist_id
        ]
      });

      // Create dispensing log
      const logId = `LOG${Date.now()}_${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
      transactionQueries.push({
        query: `
          INSERT INTO prescription_dispensing_log (
            log_id, prescription_id, prescription_medication_id, action,
            quantity, batch_number, expiry_date, unit_price, total_amount,
            dispensed_by, patient_signature, pharmacist_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: [
          logId,
          prescription.id,
          medication_id,
          isFullyDispensed ? 'DISPENSED' : 'PARTIAL_DISPENSED',
          quantity_to_dispense,
          batch_number,
          expiry_date,
          finalUnitPrice,
          totalPrice,
          pharmacist_id,
          patient_signature,
          notes
        ]
      });
    }

    // Check if all medications are now fully dispensed
    const checkCompletionQuery = `
      SELECT COUNT(*) as total, SUM(CASE WHEN is_dispensed = 1 THEN 1 ELSE 0 END) as dispensed
      FROM prescription_medications 
      WHERE prescription_id = ?
    `;

    const completionResult = await executeQuery(checkCompletionQuery, [prescription.id]);
    const { total, dispensed } = completionResult[0];

    // Update prescription status if fully dispensed
    if (total === dispensed) {
      transactionQueries.push({
        query: `
          UPDATE prescriptions 
          SET status = 'completed', updated_at = NOW()
          WHERE id = ?
        `,
        params: [prescription.id]
      });
    }

    // Execute all queries in transaction
    await executeTransaction(transactionQueries);

    return NextResponse.json({
      success: true,
      message: 'Medications dispensed successfully',
      data: {
        prescription_id: prescription.prescription_id,
        dispensed_amount: totalDispensedAmount,
        medications_dispensed: medications.length,
        prescription_status: total === dispensed ? 'completed' : 'active'
      }
    });

  } catch (error) {
    console.error('Error dispensing medications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dispense medications' },
      { status: 500 }
    );
  }
}
