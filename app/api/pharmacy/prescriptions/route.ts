// Pharmacy API - Prescription Management
// GET /api/pharmacy/prescriptions - Get prescriptions for pharmacy
// POST /api/pharmacy/prescriptions - Create new prescription

import { NextRequest, NextResponse } from 'next/server';
const { executeQuery, dbUtils } = require('@/lib/mysql-connection');

// GET - Fetch prescriptions for pharmacy processing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'active';
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const pendingOnly = searchParams.get('pendingOnly') === 'true';
    
    const offset = (page - 1) * limit;
    
    // Build WHERE conditions
    let whereConditions = ['p.status != "cancelled"'];
    let queryParams: any[] = [];
    
    if (status && status !== 'all') {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }
    
    if (patientId) {
      whereConditions.push('p.patient_id = ?');
      queryParams.push(patientId);
    }
    
    if (doctorId) {
      whereConditions.push('p.doctor_id = ?');
      queryParams.push(doctorId);
    }
    
    if (search) {
      whereConditions.push('(pt.name LIKE ? OR pt.patient_id LIKE ? OR p.prescription_id LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (dateFrom) {
      whereConditions.push('p.prescription_date >= ?');
      queryParams.push(dbUtils.formatDate(dateFrom));
    }
    
    if (dateTo) {
      whereConditions.push('p.prescription_date <= ?');
      queryParams.push(dbUtils.formatDate(dateTo));
    }
    
    if (pendingOnly) {
      whereConditions.push(`
        EXISTS (
          SELECT 1 FROM prescription_medications pm 
          WHERE pm.prescription_id = p.id AND pm.is_dispensed = 0
        )
      `);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Main query
    const query = `
      SELECT 
        p.id,
        p.prescription_id,
        p.patient_id,
        p.doctor_id,
        p.prescription_date,
        p.total_amount,
        p.status,
        p.notes,
        p.follow_up_date,
        pt.name as patient_name,
        pt.patient_id as patient_code,
        pt.contact_number as patient_phone,
        pt.age,
        pt.gender,
        d.name as doctor_name,
        d.specialization,
        COUNT(pm.id) as total_medications,
        SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) as dispensed_medications,
        CASE 
          WHEN COUNT(pm.id) = SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) THEN 'fully_dispensed'
          WHEN SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) > 0 THEN 'partially_dispensed'
          ELSE 'pending'
        END as dispensing_status,
        p.created_at,
        p.updated_at
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      JOIN users d ON p.doctor_id = d.id
      LEFT JOIN prescription_medications pm ON p.id = pm.prescription_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY 
        CASE 
          WHEN p.status = 'active' AND COUNT(pm.id) > SUM(CASE WHEN pm.is_dispensed = 1 THEN 1 ELSE 0 END) THEN 1
          ELSE 2
        END,
        p.prescription_date DESC,
        p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(limit, offset);
    
    // Count query for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      JOIN users d ON p.doctor_id = d.id
      LEFT JOIN prescription_medications pm ON p.id = pm.prescription_id
      ${whereClause}
    `;
    
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    
    // Execute queries
    const [prescriptions, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, countParams)
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    // Get prescription statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_prescriptions,
        SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_prescriptions,
        SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completed_prescriptions,
        SUM(CASE WHEN EXISTS (
          SELECT 1 FROM prescription_medications pm 
          WHERE pm.prescription_id = p.id AND pm.is_dispensed = 0
        ) THEN 1 ELSE 0 END) as pending_dispensing,
        SUM(p.total_amount) as total_value
      FROM prescriptions p
      WHERE p.prescription_date >= CURDATE() - INTERVAL 30 DAY
    `;
    
    const stats = await executeQuery(statsQuery);
    
    return NextResponse.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        statistics: stats[0] || {}
      }
    });
    
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch prescriptions'
    }, { status: 500 });
  }
}

// POST - Create new prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['patient_id', 'doctor_id', 'medications'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 });
      }
    }
    
    if (!Array.isArray(body.medications) || body.medications.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one medication is required'
      }, { status: 400 });
    }
    
    // Validate patient and doctor exist
    const [patient, doctor] = await Promise.all([
      executeQuery('SELECT id FROM patients WHERE (id = ? OR patient_id = ?) AND is_active = 1', 
        [body.patient_id, body.patient_id]),
      executeQuery('SELECT id FROM users WHERE (id = ? OR user_id = ?) AND role = "doctor" AND is_active = 1', 
        [body.doctor_id, body.doctor_id])
    ]);
    
    if (patient.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Patient not found'
      }, { status: 404 });
    }
    
    if (doctor.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Doctor not found'
      }, { status: 404 });
    }
    
    // Generate prescription ID
    const prescriptionId = dbUtils.generateId('RX');
    
    // Calculate total amount
    let totalAmount = 0;
    const medicationData = [];
    
    // Validate medications and calculate total
    for (const med of body.medications) {
      if (!med.medicine_id || !med.quantity || !med.dosage || !med.frequency || !med.duration) {
        return NextResponse.json({
          success: false,
          error: 'All medication fields (medicine_id, quantity, dosage, frequency, duration) are required'
        }, { status: 400 });
      }
      
      // Get medicine details
      const medicine = await executeQuery(
        'SELECT * FROM medicines WHERE (id = ? OR medicine_id = ?) AND is_active = 1',
        [med.medicine_id, med.medicine_id]
      );
      
      if (medicine.length === 0) {
        return NextResponse.json({
          success: false,
          error: `Medicine not found: ${med.medicine_id}`
        }, { status: 404 });
      }
      
      const medicineInfo = medicine[0];
      const quantity = parseInt(med.quantity);
      const unitPrice = medicineInfo.unit_price;
      const totalPrice = quantity * unitPrice;
      
      totalAmount += totalPrice;
      
      medicationData.push({
        medicine_id: medicineInfo.id,
        medicine_name: medicineInfo.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        instructions: med.instructions || '',
        is_dispensed: false
      });
    }
    
    // Prepare prescription data
    const prescriptionData = {
      prescription_id: prescriptionId,
      patient_id: patient[0].id,
      doctor_id: doctor[0].id,
      appointment_id: body.appointment_id || null,
      medical_record_id: body.medical_record_id || null,
      prescription_date: body.prescription_date ? dbUtils.formatDate(body.prescription_date) : dbUtils.formatDate(new Date()),
      total_amount: totalAmount,
      status: 'active',
      notes: body.notes || '',
      follow_up_date: body.follow_up_date ? dbUtils.formatDate(body.follow_up_date) : null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Execute transaction
    const queries = [
      // Insert prescription
      {
        query: `
          INSERT INTO prescriptions (
            prescription_id, patient_id, doctor_id, appointment_id, medical_record_id,
            prescription_date, total_amount, status, notes, follow_up_date, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        params: Object.values(prescriptionData)
      }
    ];
    
    // Execute prescription insert first to get ID
    const prescriptionResult = await executeQuery(queries[0].query, queries[0].params);
    const prescriptionDbId = prescriptionResult.insertId;
    
    // Insert medications
    for (const med of medicationData) {
      const medQuery = `
        INSERT INTO prescription_medications (
          prescription_id, medicine_id, medicine_name, dosage, frequency, duration,
          quantity, unit_price, total_price, instructions, is_dispensed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await executeQuery(medQuery, [
        prescriptionDbId,
        med.medicine_id,
        med.medicine_name,
        med.dosage,
        med.frequency,
        med.duration,
        med.quantity,
        med.unit_price,
        med.total_price,
        med.instructions,
        med.is_dispensed
      ]);
    }
    
    // Fetch the created prescription with details
    const createdPrescription = await executeQuery(`
      SELECT 
        p.*,
        pt.name as patient_name,
        pt.patient_id as patient_code,
        d.name as doctor_name,
        d.specialization
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      JOIN users d ON p.doctor_id = d.id
      WHERE p.id = ?
    `, [prescriptionDbId]);
    
    // Fetch prescription medications
    const medications = await executeQuery(`
      SELECT pm.*, m.generic_name, m.brand_name, m.current_stock
      FROM prescription_medications pm
      JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.prescription_id = ?
    `, [prescriptionDbId]);
    
    return NextResponse.json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescription: createdPrescription[0],
        medications: medications
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create prescription'
    }, { status: 500 });
  }
}
