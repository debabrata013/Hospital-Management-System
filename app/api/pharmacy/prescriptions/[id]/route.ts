// Pharmacy API - Individual Prescription Management
// GET /api/pharmacy/prescriptions/[id] - Get prescription details
// PUT /api/pharmacy/prescriptions/[id] - Update prescription
// DELETE /api/pharmacy/prescriptions/[id] - Cancel prescription

import { NextRequest, NextResponse } from 'next/server';
const { executeQuery, dbUtils } = require('@/lib/mysql-connection');

// GET - Fetch prescription details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = params.id;
    
    // Fetch prescription details
    const prescriptionQuery = `
      SELECT 
        p.*,
        pt.name as patient_name,
        pt.patient_id as patient_code,
        pt.contact_number as patient_phone,
        pt.date_of_birth,
        pt.gender,
        pt.blood_group,
        pt.allergies,
        pt.current_medications,
        d.name as doctor_name,
        d.specialization,
        d.license_number,
        a.appointment_date,
        a.appointment_time,
        mr.diagnosis,
        mr.doctor_notes
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      JOIN users d ON p.doctor_id = d.id
      LEFT JOIN appointments a ON p.appointment_id = a.id
      LEFT JOIN medical_records mr ON p.medical_record_id = mr.id
      WHERE (p.id = ? OR p.prescription_id = ?)
    `;
    
    const prescription = await executeQuery(prescriptionQuery, [prescriptionId, prescriptionId]);
    
    if (prescription.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Prescription not found'
      }, { status: 404 });
    }
    
    const prescriptionData = prescription[0];
    
    // Fetch prescription medications with medicine details
    const medicationsQuery = `
      SELECT 
        pm.*,
        m.generic_name,
        m.brand_name,
        m.category,
        m.manufacturer,
        m.current_stock,
        m.minimum_stock,
        m.expiry_date,
        m.batch_number,
        m.side_effects,
        m.contraindications,
        m.drug_interactions,
        CASE 
          WHEN m.current_stock >= pm.quantity THEN 'available'
          WHEN m.current_stock > 0 THEN 'partial'
          ELSE 'out_of_stock'
        END as availability_status,
        CASE 
          WHEN m.expiry_date <= CURDATE() THEN 'expired'
          WHEN m.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'expiring_soon'
          ELSE 'good'
        END as expiry_status
      FROM prescription_medications pm
      JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.prescription_id = ?
      ORDER BY pm.id
    `;
    
    const medications = await executeQuery(medicationsQuery, [prescriptionData.id]);
    
    // Calculate dispensing summary
    const dispensingSummary = {
      total_medications: medications.length,
      dispensed_medications: medications.filter((med: any) => med.is_dispensed).length,
      pending_medications: medications.filter((med: any) => !med.is_dispensed).length,
      out_of_stock_medications: medications.filter((med: any) => med.availability_status === 'out_of_stock').length,
      total_amount: prescriptionData.total_amount,
      dispensed_amount: medications
        .filter((med: any) => med.is_dispensed)
        .reduce((sum: number, med: any) => sum + parseFloat(med.total_price), 0),
      pending_amount: medications
        .filter((med: any) => !med.is_dispensed)
        .reduce((sum: number, med: any) => sum + parseFloat(med.total_price), 0)
    };
    
    // Fetch dispensing history
    const dispensingHistoryQuery = `
      SELECT 
        mst.*,
        u.name as dispensed_by_name
      FROM medicine_stock_transactions mst
      JOIN users u ON mst.created_by = u.id
      WHERE mst.reference_id = ? AND mst.transaction_type = 'sale'
      ORDER BY mst.created_at DESC
    `;
    
    const dispensingHistory = await executeQuery(dispensingHistoryQuery, [prescriptionData.prescription_id]);
    
    return NextResponse.json({
      success: true,
      data: {
        prescription: prescriptionData,
        medications: medications,
        dispensing_summary: dispensingSummary,
        dispensing_history: dispensingHistory
      }
    });
    
  } catch (error) {
    console.error('Error fetching prescription details:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch prescription details'
    }, { status: 500 });
  }
}

// PUT - Update prescription (mainly for dispensing)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = params.id;
    const body = await request.json();
    
    // Check if prescription exists
    const existingPrescription = await executeQuery(
      'SELECT * FROM prescriptions WHERE (id = ? OR prescription_id = ?)',
      [prescriptionId, prescriptionId]
    );
    
    if (existingPrescription.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Prescription not found'
      }, { status: 404 });
    }
    
    const prescription = existingPrescription[0];
    
    // Handle different update types
    if (body.action === 'dispense_medication') {
      return await dispenseMedication(prescription, body);
    } else if (body.action === 'dispense_all') {
      return await dispenseAllMedications(prescription, body);
    } else if (body.action === 'update_status') {
      return await updatePrescriptionStatus(prescription, body);
    } else {
      return await updatePrescriptionDetails(prescription, body);
    }
    
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update prescription'
    }, { status: 500 });
  }
}

// Helper function to dispense individual medication
async function dispenseMedication(prescription: any, body: any) {
  const { medication_id, quantity_dispensed, notes } = body;
  
  if (!medication_id || !quantity_dispensed) {
    return NextResponse.json({
      success: false,
      error: 'medication_id and quantity_dispensed are required'
    }, { status: 400 });
  }
  
  // Get medication details
  const medication = await executeQuery(
    'SELECT * FROM prescription_medications WHERE id = ? AND prescription_id = ?',
    [medication_id, prescription.id]
  );
  
  if (medication.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'Medication not found in prescription'
    }, { status: 404 });
  }
  
  const med = medication[0];
  
  if (med.is_dispensed) {
    return NextResponse.json({
      success: false,
      error: 'Medication already dispensed'
    }, { status: 400 });
  }
  
  // Check stock availability
  const medicine = await executeQuery(
    'SELECT * FROM medicines WHERE id = ?',
    [med.medicine_id]
  );
  
  if (medicine.length === 0 || medicine[0].current_stock < quantity_dispensed) {
    return NextResponse.json({
      success: false,
      error: 'Insufficient stock available'
    }, { status: 400 });
  }
  
  const medicineData = medicine[0];
  
  // Execute dispensing transaction
  const queries = [
    // Update prescription medication as dispensed
    {
      query: 'UPDATE prescription_medications SET is_dispensed = 1, dispensed_at = ?, dispensed_by = ? WHERE id = ?',
      params: [new Date(), 1, medication_id] // TODO: Get user from auth
    },
    // Update medicine stock
    {
      query: 'UPDATE medicines SET current_stock = current_stock - ?, updated_at = ? WHERE id = ?',
      params: [quantity_dispensed, new Date(), med.medicine_id]
    },
    // Create stock transaction
    {
      query: `
        INSERT INTO medicine_stock_transactions (
          medicine_id, transaction_type, quantity, unit_price, total_amount,
          batch_number, expiry_date, supplier, reference_id, notes, created_by, created_at
        ) VALUES (?, 'sale', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        med.medicine_id,
        quantity_dispensed,
        med.unit_price,
        quantity_dispensed * med.unit_price,
        medicineData.batch_number,
        medicineData.expiry_date,
        medicineData.supplier,
        prescription.prescription_id,
        notes || `Dispensed for prescription ${prescription.prescription_id}`,
        1, // TODO: Get user from auth
        new Date()
      ]
    }
  ];
  
  await Promise.all(queries.map(q => executeQuery(q.query, q.params)));
  
  // Check if all medications are dispensed to update prescription status
  const remainingMeds = await executeQuery(
    'SELECT COUNT(*) as count FROM prescription_medications WHERE prescription_id = ? AND is_dispensed = 0',
    [prescription.id]
  );
  
  if (remainingMeds[0].count === 0) {
    await executeQuery(
      'UPDATE prescriptions SET status = "completed", updated_at = ? WHERE id = ?',
      [new Date(), prescription.id]
    );
  }
  
  return NextResponse.json({
    success: true,
    message: 'Medication dispensed successfully'
  });
}

// Helper function to dispense all medications
async function dispenseAllMedications(prescription: any, body: any) {
  // Get all pending medications
  const pendingMeds = await executeQuery(
    `SELECT pm.*, m.current_stock 
     FROM prescription_medications pm
     JOIN medicines m ON pm.medicine_id = m.id
     WHERE pm.prescription_id = ? AND pm.is_dispensed = 0`,
    [prescription.id]
  );
  
  if (pendingMeds.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'No pending medications to dispense'
    }, { status: 400 });
  }
  
  // Check stock for all medications
  const stockIssues = [];
  for (const med of pendingMeds) {
    if (med.current_stock < med.quantity) {
      stockIssues.push({
        medicine_name: med.medicine_name,
        required: med.quantity,
        available: med.current_stock
      });
    }
  }
  
  if (stockIssues.length > 0) {
    return NextResponse.json({
      success: false,
      error: 'Insufficient stock for some medications',
      stock_issues: stockIssues
    }, { status: 400 });
  }
  
  // Dispense all medications
  const queries = [];
  
  for (const med of pendingMeds) {
    // Update prescription medication
    queries.push({
      query: 'UPDATE prescription_medications SET is_dispensed = 1, dispensed_at = ?, dispensed_by = ? WHERE id = ?',
      params: [new Date(), 1, med.id] // TODO: Get user from auth
    });
    
    // Update medicine stock
    queries.push({
      query: 'UPDATE medicines SET current_stock = current_stock - ?, updated_at = ? WHERE id = ?',
      params: [med.quantity, new Date(), med.medicine_id]
    });
    
    // Create stock transaction
    queries.push({
      query: `
        INSERT INTO medicine_stock_transactions (
          medicine_id, transaction_type, quantity, unit_price, total_amount,
          reference_id, notes, created_by, created_at
        ) VALUES (?, 'sale', ?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        med.medicine_id,
        med.quantity,
        med.unit_price,
        med.quantity * med.unit_price,
        prescription.prescription_id,
        `Full prescription dispensed: ${prescription.prescription_id}`,
        1, // TODO: Get user from auth
        new Date()
      ]
    });
  }
  
  // Update prescription status
  queries.push({
    query: 'UPDATE prescriptions SET status = "completed", updated_at = ? WHERE id = ?',
    params: [new Date(), prescription.id]
  });
  
  await Promise.all(queries.map(q => executeQuery(q.query, q.params)));
  
  return NextResponse.json({
    success: true,
    message: 'All medications dispensed successfully'
  });
}

// Helper function to update prescription status
async function updatePrescriptionStatus(prescription: any, body: any) {
  const { status, notes } = body;
  
  const validStatuses = ['active', 'completed', 'cancelled', 'expired'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid status'
    }, { status: 400 });
  }
  
  await executeQuery(
    'UPDATE prescriptions SET status = ?, notes = ?, updated_at = ? WHERE id = ?',
    [status, notes || prescription.notes, new Date(), prescription.id]
  );
  
  return NextResponse.json({
    success: true,
    message: 'Prescription status updated successfully'
  });
}

// Helper function to update prescription details
async function updatePrescriptionDetails(prescription: any, body: any) {
  const updateData: any = {
    updated_at: new Date()
  };
  
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.follow_up_date !== undefined) {
    updateData.follow_up_date = body.follow_up_date ? dbUtils.formatDate(body.follow_up_date) : null;
  }
  
  const { query, params } = dbUtils.buildUpdateQuery(
    'prescriptions',
    updateData,
    { id: prescription.id }
  );
  
  await executeQuery(query, params);
  
  return NextResponse.json({
    success: true,
    message: 'Prescription updated successfully'
  });
}

// DELETE - Cancel prescription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = params.id;
    
    // Check if prescription exists
    const existingPrescription = await executeQuery(
      'SELECT * FROM prescriptions WHERE (id = ? OR prescription_id = ?)',
      [prescriptionId, prescriptionId]
    );
    
    if (existingPrescription.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Prescription not found'
      }, { status: 404 });
    }
    
    const prescription = existingPrescription[0];
    
    // Check if any medications have been dispensed
    const dispensedMeds = await executeQuery(
      'SELECT COUNT(*) as count FROM prescription_medications WHERE prescription_id = ? AND is_dispensed = 1',
      [prescription.id]
    );
    
    if (dispensedMeds[0].count > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot cancel prescription with dispensed medications'
      }, { status: 400 });
    }
    
    // Cancel prescription
    await executeQuery(
      'UPDATE prescriptions SET status = "cancelled", updated_at = ? WHERE id = ?',
      [new Date(), prescription.id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Prescription cancelled successfully'
    });
    
  } catch (error) {
    console.error('Error cancelling prescription:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel prescription'
    }, { status: 500 });
  }
}
