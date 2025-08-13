// Prescription Management API Routes - MySQL Implementation
// Hospital Management System - Arogya Hospital

import { NextResponse } from 'next/server';
import { executeQuery, executeTransaction, dbUtils } from '../../../lib/mysql-connection.js';
import { verifyToken } from '../../../lib/auth-middleware.js';

// GET - Fetch prescriptions with filters
export async function GET(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    // Role-based filtering
    if (authResult.user.role === 'doctor') {
      whereConditions.push('pr.doctor_id = ?');
      queryParams.push(authResult.user.userId);
    }

    if (patientId) {
      whereConditions.push('pr.patient_id = ?');
      queryParams.push(patientId);
    }

    if (doctorId && authResult.user.role !== 'doctor') {
      whereConditions.push('pr.doctor_id = ?');
      queryParams.push(doctorId);
    }

    if (status) {
      whereConditions.push('pr.status = ?');
      queryParams.push(status);
    }

    if (dateFrom) {
      whereConditions.push('pr.prescription_date >= ?');
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      whereConditions.push('pr.prescription_date <= ?');
      queryParams.push(dateTo);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM prescriptions pr 
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const totalPrescriptions = countResult[0].total;

    // Get prescriptions with patient and doctor details
    const prescriptionsQuery = `
      SELECT 
        pr.id,
        pr.prescription_id,
        pr.prescription_date,
        pr.total_amount,
        pr.status,
        pr.notes,
        pr.follow_up_date,
        pr.created_at,
        p.patient_id,
        p.name as patient_name,
        p.contact_number as patient_contact,
        p.date_of_birth as patient_dob,
        d.name as doctor_name,
        d.specialization as doctor_specialization,
        d.department as doctor_department,
        a.appointment_id,
        a.appointment_date,
        COUNT(pm.id) as medication_count
      FROM prescriptions pr
      INNER JOIN patients p ON pr.patient_id = p.id
      INNER JOIN users d ON pr.doctor_id = d.id
      LEFT JOIN appointments a ON pr.appointment_id = a.id
      LEFT JOIN prescription_medications pm ON pr.id = pm.prescription_id
      ${whereClause}
      GROUP BY pr.id
      ORDER BY pr.prescription_date DESC, pr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const prescriptions = await executeQuery(prescriptionsQuery, [...queryParams, limit, offset]);

    // Get medications for each prescription
    for (let prescription of prescriptions) {
      const medications = await executeQuery(`
        SELECT 
          pm.*,
          m.name as medicine_name,
          m.generic_name,
          m.strength,
          m.dosage_form
        FROM prescription_medications pm
        LEFT JOIN medicines m ON pm.medicine_id = m.id
        WHERE pm.prescription_id = ?
        ORDER BY pm.id
      `, [prescription.id]);

      prescription.medications = medications;
      prescription.patient_age = prescription.patient_dob ? 
        Math.floor((new Date() - new Date(prescription.patient_dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 
        null;
    }

    return NextResponse.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPrescriptions / limit),
          totalPrescriptions,
          hasNextPage: page < Math.ceil(totalPrescriptions / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}

// POST - Create new prescription
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const prescriptionData = await request.json();

    // Validate required fields
    const requiredFields = ['patientId', 'doctorId', 'medications'];
    for (const field of requiredFields) {
      if (!prescriptionData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(prescriptionData.medications) || prescriptionData.medications.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one medication is required' },
        { status: 400 }
      );
    }

    // Validate patient exists
    const patient = await executeQuery(
      'SELECT id FROM patients WHERE id = ? AND is_active = TRUE',
      [prescriptionData.patientId]
    );

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    // Validate doctor exists
    const doctor = await executeQuery(
      'SELECT id FROM users WHERE id = ? AND role = "doctor" AND is_active = TRUE',
      [prescriptionData.doctorId]
    );

    if (doctor.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check if doctor can prescribe (role-based access)
    if (authResult.user.role === 'doctor' && authResult.user.userId !== prescriptionData.doctorId) {
      return NextResponse.json(
        { success: false, message: 'You can only create prescriptions for yourself' },
        { status: 403 }
      );
    }

    // Generate unique prescription ID
    const prescriptionId = dbUtils.generateId('RX');

    // Calculate total amount
    let totalAmount = 0;
    const medicationQueries = [];

    // Prepare prescription data
    const prescriptionInsertData = {
      prescription_id: prescriptionId,
      patient_id: prescriptionData.patientId,
      doctor_id: prescriptionData.doctorId,
      appointment_id: prescriptionData.appointmentId || null,
      medical_record_id: prescriptionData.medicalRecordId || null,
      prescription_date: dbUtils.formatDate(prescriptionData.prescriptionDate || new Date()),
      notes: prescriptionData.notes || null,
      follow_up_date: prescriptionData.followUpDate ? dbUtils.formatDate(prescriptionData.followUpDate) : null,
      total_amount: 0 // Will be updated after calculating medication costs
    };

    // Prepare medication data and calculate costs
    for (const med of prescriptionData.medications) {
      // Validate medication
      if (!med.medicineName || !med.dosage || !med.frequency || !med.duration || !med.quantity) {
        return NextResponse.json(
          { success: false, message: 'All medication fields are required' },
          { status: 400 }
        );
      }

      // Get medicine details if medicine_id is provided
      let unitPrice = med.unitPrice || 0;
      if (med.medicineId) {
        const medicine = await executeQuery(
          'SELECT unit_price FROM medicines WHERE id = ? AND is_active = TRUE',
          [med.medicineId]
        );
        if (medicine.length > 0) {
          unitPrice = medicine[0].unit_price;
        }
      }

      const totalPrice = unitPrice * med.quantity;
      totalAmount += totalPrice;

      medicationQueries.push({
        query: `INSERT INTO prescription_medications 
                (prescription_id, medicine_id, medicine_name, dosage, frequency, duration, 
                 quantity, unit_price, total_price, instructions) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          null, // Will be set after prescription is created
          med.medicineId || null,
          med.medicineName,
          med.dosage,
          med.frequency,
          med.duration,
          med.quantity,
          unitPrice,
          totalPrice,
          med.instructions || null
        ]
      });
    }

    // Update total amount
    prescriptionInsertData.total_amount = totalAmount;

    // Execute transaction
    const transactionQueries = [];

    // Insert prescription
    const { query: prescriptionQuery, params: prescriptionParams } = 
      dbUtils.buildInsertQuery('prescriptions', prescriptionInsertData);
    transactionQueries.push({ query: prescriptionQuery, params: prescriptionParams });

    const results = await executeTransaction(transactionQueries);
    const prescriptionDbId = results[0].insertId;

    // Insert medications
    const medicationInsertQueries = medicationQueries.map(mq => ({
      query: mq.query,
      params: [prescriptionDbId, ...mq.params.slice(1)]
    }));

    await executeTransaction(medicationInsertQueries);

    // Log the creation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, new_values, created_at) 
       VALUES (?, ?, 'CREATE', 'prescriptions', ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        prescriptionDbId.toString(),
        JSON.stringify(prescriptionInsertData)
      ]
    );

    // Create notification for patient (if they have an account)
    const patientUser = await executeQuery(
      'SELECT id FROM users WHERE email = (SELECT email FROM patients WHERE id = ?)',
      [prescriptionData.patientId]
    );

    if (patientUser.length > 0) {
      await executeQuery(
        `INSERT INTO system_notifications (notification_id, user_id, notification_type, title, message, priority, created_at)
         VALUES (?, ?, 'prescription', ?, ?, 'medium', CURRENT_TIMESTAMP)`,
        [
          dbUtils.generateId('NOT'),
          patientUser[0].id,
          'New Prescription Available',
          `A new prescription has been created by Dr. ${authResult.user.name}`
        ]
      );
    }

    // Fetch the created prescription with details
    const createdPrescription = await executeQuery(`
      SELECT 
        pr.*,
        p.name as patient_name,
        p.contact_number as patient_contact,
        d.name as doctor_name,
        d.specialization as doctor_specialization
      FROM prescriptions pr
      INNER JOIN patients p ON pr.patient_id = p.id
      INNER JOIN users d ON pr.doctor_id = d.id
      WHERE pr.id = ?
    `, [prescriptionDbId]);

    // Get medications
    const medications = await executeQuery(`
      SELECT pm.*, m.name as medicine_name, m.generic_name
      FROM prescription_medications pm
      LEFT JOIN medicines m ON pm.medicine_id = m.id
      WHERE pm.prescription_id = ?
    `, [prescriptionDbId]);

    createdPrescription[0].medications = medications;

    return NextResponse.json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescription: createdPrescription[0]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}

// PUT - Update prescription
export async function PUT(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('id');
    
    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: 'Prescription ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Get existing prescription
    const existingPrescription = await executeQuery(
      'SELECT * FROM prescriptions WHERE id = ?',
      [prescriptionId]
    );

    if (existingPrescription.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (authResult.user.role === 'doctor' && 
        existingPrescription[0].doctor_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this prescription' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateFields = {};
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.notes !== undefined) updateFields.notes = updateData.notes;
    if (updateData.followUpDate !== undefined) {
      updateFields.follow_up_date = updateData.followUpDate ? 
        dbUtils.formatDate(updateData.followUpDate) : null;
    }

    updateFields.updated_at = new Date();

    // Update prescription
    const { query, params } = dbUtils.buildUpdateQuery('prescriptions', updateFields, { id: prescriptionId });
    await executeQuery(query, params);

    // Log the update
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, new_values, created_at) 
       VALUES (?, ?, 'UPDATE', 'prescriptions', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        prescriptionId,
        JSON.stringify(existingPrescription[0]),
        JSON.stringify(updateFields)
      ]
    );

    // Fetch updated prescription
    const updatedPrescription = await executeQuery(`
      SELECT 
        pr.*,
        p.name as patient_name,
        d.name as doctor_name
      FROM prescriptions pr
      INNER JOIN patients p ON pr.patient_id = p.id
      INNER JOIN users d ON pr.doctor_id = d.id
      WHERE pr.id = ?
    `, [prescriptionId]);

    return NextResponse.json({
      success: true,
      message: 'Prescription updated successfully',
      data: {
        prescription: updatedPrescription[0]
      }
    });

  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update prescription' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel prescription
export async function DELETE(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('id');
    
    if (!prescriptionId) {
      return NextResponse.json(
        { success: false, message: 'Prescription ID is required' },
        { status: 400 }
      );
    }

    // Get existing prescription
    const existingPrescription = await executeQuery(
      'SELECT * FROM prescriptions WHERE id = ?',
      [prescriptionId]
    );

    if (existingPrescription.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (authResult.user.role === 'doctor' && 
        existingPrescription[0].doctor_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to cancel this prescription' },
        { status: 403 }
      );
    }

    // Update prescription status to cancelled
    await executeQuery(
      'UPDATE prescriptions SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [prescriptionId]
    );

    // Log the cancellation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, additional_info, created_at) 
       VALUES (?, ?, 'UPDATE', 'prescriptions', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        prescriptionId,
        JSON.stringify(existingPrescription[0]),
        JSON.stringify({ action: 'cancelled' })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Prescription cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling prescription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel prescription' },
      { status: 500 }
    );
  }
}
