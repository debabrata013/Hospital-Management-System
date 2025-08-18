// Patient Management API Routes - MySQL Implementation
// Hospital Management System - Arogya Hospital

import { NextResponse } from 'next/server';
import { executeQuery, dbUtils } from '../../../lib/mysql-connection';
import { verifyToken } from '../../../lib/auth-middleware';

// GET - Fetch all patients with pagination and search
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
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const offset = (page - 1) * limit;

    // Build search conditions
    let whereClause = 'WHERE p.is_active = TRUE';
    let queryParams = [];

    if (search) {
      whereClause += ` AND (
        p.name LIKE ? OR 
        p.patient_id LIKE ? OR 
        p.contact_number LIKE ? OR 
        p.email LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM patients p 
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const totalPatients = countResult[0].total;

    // Get patients with pagination
    const patientsQuery = `
      SELECT 
        p.id,
        p.patient_id,
        p.name,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.contact_number,
        p.email,
        p.address,
        p.city,
        p.state,
        p.marital_status,
        p.occupation,
        p.emergency_contact_name,
        p.emergency_contact_number,
        p.insurance_provider,
        p.profile_image,
        p.registration_date,
        p.created_at,
        u.name as created_by_name
      FROM patients p
      LEFT JOIN users u ON p.created_by = u.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const patients = await executeQuery(patientsQuery, [...queryParams, limit, offset]);

    // Calculate age for each patient
    const patientsWithAge = patients.map(patient => ({
      ...patient,
      age: patient.date_of_birth ? 
        Math.floor((new Date() - new Date(patient.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : 
        null
    }));

    return NextResponse.json({
      success: true,
      data: {
        patients: patientsWithAge,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPatients / limit),
          totalPatients,
          hasNextPage: page < Math.ceil(totalPatients / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST - Create new patient
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const patientData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'dateOfBirth', 'gender', 'contactNumber', 'address', 'emergencyContactName', 'emergencyContactNumber'];
    for (const field of requiredFields) {
      if (!patientData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if patient with same contact number already exists
    const existingPatient = await executeQuery(
      'SELECT id FROM patients WHERE contact_number = ? AND is_active = TRUE',
      [patientData.contactNumber]
    );

    if (existingPatient.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Patient with this contact number already exists' },
        { status: 409 }
      );
    }

    // Generate unique patient ID
    const patientId = dbUtils.generateId('PAT');

    // Prepare patient data for insertion
    const insertData = {
      patient_id: patientId,
      name: patientData.name,
      date_of_birth: dbUtils.formatDate(patientData.dateOfBirth),
      gender: patientData.gender,
      blood_group: patientData.bloodGroup || 'Unknown',
      contact_number: patientData.contactNumber,
      email: patientData.email || null,
      address: patientData.address,
      city: patientData.city || null,
      state: patientData.state || null,
      pincode: patientData.pincode || null,
      marital_status: patientData.maritalStatus || 'Single',
      occupation: patientData.occupation || null,
      emergency_contact_name: patientData.emergencyContactName,
      emergency_contact_number: patientData.emergencyContactNumber,
      emergency_contact_relation: patientData.emergencyContactRelation || null,
      insurance_provider: patientData.insuranceProvider || null,
      insurance_policy_number: patientData.insurancePolicyNumber || null,
      insurance_expiry_date: patientData.insuranceExpiryDate ? dbUtils.formatDate(patientData.insuranceExpiryDate) : null,
      aadhar_number: patientData.aadharNumber || null,
      medical_history: patientData.medicalHistory || null,
      allergies: patientData.allergies || null,
      current_medications: patientData.currentMedications || null,
      created_by: authResult.user.userId
    };

    // Insert patient
    const { query, params } = dbUtils.buildInsertQuery('patients', insertData);
    const result = await executeQuery(query, params);

    // Log the creation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, new_values, created_at) 
       VALUES (?, ?, 'CREATE', 'patients', ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        result.insertId.toString(),
        JSON.stringify(insertData)
      ]
    );

    // Fetch the created patient
    const createdPatient = await executeQuery(
      'SELECT * FROM patients WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json({
      success: true,
      message: 'Patient created successfully',
      data: {
        patient: createdPatient[0]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create patient' },
      { status: 500 }
    );
  }
}

// PUT - Update patient
export async function PUT(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');
    
    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Get existing patient data for audit log
    const existingPatient = await executeQuery(
      'SELECT * FROM patients WHERE id = ? AND is_active = TRUE',
      [patientId]
    );

    if (existingPatient.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateFields = {};
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.dateOfBirth) updateFields.date_of_birth = dbUtils.formatDate(updateData.dateOfBirth);
    if (updateData.gender) updateFields.gender = updateData.gender;
    if (updateData.bloodGroup) updateFields.blood_group = updateData.bloodGroup;
    if (updateData.contactNumber) updateFields.contact_number = updateData.contactNumber;
    if (updateData.email !== undefined) updateFields.email = updateData.email;
    if (updateData.address) updateFields.address = updateData.address;
    if (updateData.city !== undefined) updateFields.city = updateData.city;
    if (updateData.state !== undefined) updateFields.state = updateData.state;
    if (updateData.pincode !== undefined) updateFields.pincode = updateData.pincode;
    if (updateData.maritalStatus) updateFields.marital_status = updateData.maritalStatus;
    if (updateData.occupation !== undefined) updateFields.occupation = updateData.occupation;
    if (updateData.emergencyContactName) updateFields.emergency_contact_name = updateData.emergencyContactName;
    if (updateData.emergencyContactNumber) updateFields.emergency_contact_number = updateData.emergencyContactNumber;
    if (updateData.emergencyContactRelation !== undefined) updateFields.emergency_contact_relation = updateData.emergencyContactRelation;
    if (updateData.insuranceProvider !== undefined) updateFields.insurance_provider = updateData.insuranceProvider;
    if (updateData.insurancePolicyNumber !== undefined) updateFields.insurance_policy_number = updateData.insurancePolicyNumber;
    if (updateData.insuranceExpiryDate !== undefined) updateFields.insurance_expiry_date = updateData.insuranceExpiryDate ? dbUtils.formatDate(updateData.insuranceExpiryDate) : null;
    if (updateData.medicalHistory !== undefined) updateFields.medical_history = updateData.medicalHistory;
    if (updateData.allergies !== undefined) updateFields.allergies = updateData.allergies;
    if (updateData.currentMedications !== undefined) updateFields.current_medications = updateData.currentMedications;

    updateFields.updated_at = new Date();

    // Update patient
    const { query, params } = dbUtils.buildUpdateQuery('patients', updateFields, { id: patientId });
    await executeQuery(query, params);

    // Log the update
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, new_values, created_at) 
       VALUES (?, ?, 'UPDATE', 'patients', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        patientId,
        JSON.stringify(existingPatient[0]),
        JSON.stringify(updateFields)
      ]
    );

    // Fetch updated patient
    const updatedPatient = await executeQuery(
      'SELECT * FROM patients WHERE id = ?',
      [patientId]
    );

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully',
      data: {
        patient: updatedPatient[0]
      }
    });

  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete patient
export async function DELETE(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');
    
    if (!patientId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Check if patient exists
    const existingPatient = await executeQuery(
      'SELECT * FROM patients WHERE id = ? AND is_active = TRUE',
      [patientId]
    );

    if (existingPatient.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      );
    }

    // Soft delete patient
    await executeQuery(
      'UPDATE patients SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [patientId]
    );

    // Log the deletion
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, created_at) 
       VALUES (?, ?, 'DELETE', 'patients', ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        patientId,
        JSON.stringify(existingPatient[0])
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
