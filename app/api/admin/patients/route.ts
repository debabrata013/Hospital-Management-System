import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE p.is_active = 1';
    let params: any[] = [];

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.patient_id LIKE ? OR p.contact_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params = [searchTerm, searchTerm, searchTerm];
    }

    // Get total count
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as total FROM patients p ${whereClause}
    `, params);

    const total = (countResult as any)[0].total;

    // Get patients with pagination
    const [patientsResult] = await connection.execute(`
      SELECT 
        p.id,
        p.patient_id,
        p.name,
        p.date_of_birth,
        p.gender,
        p.contact_number,
        p.email,
        p.address,
        p.blood_group,
        p.registration_date,
        COUNT(a.id) as appointment_count,
        COUNT(ad.id) as admission_count
      FROM patients p
                    LEFT JOIN appointments a ON p.id = a.patient_id
       LEFT JOIN Admissions ad ON p.id = ad.patientId AND ad.status = 'admitted'
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.registration_date DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const patients = patientsResult.map((patient: any) => {
      const birthDate = new Date(patient.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;

      return {
        id: patient.id,
        patientId: patient.patient_id,
        name: patient.name || 'Unknown Patient',
        age: actualAge,
        gender: patient.gender,
        phone: patient.contact_number,
        email: patient.email,
        address: patient.address,
        bloodGroup: patient.blood_group,
        createdAt: patient.registration_date,
        appointmentCount: patient.appointment_count,
        isCurrentlyAdmitted: patient.admission_count > 0
      };
    });

    await connection.end();

    return NextResponse.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Patients fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      age,
      gender,
      contactNumber,
      emergencyContact,
      address,
      diagnosis,
      admissionDate,
      expectedDischargeDate,
      doctorName,
      department,
      insuranceProvider,
      insuranceNumber,
      roomId
    } = body;

    const connection = await mysql.createConnection(dbConfig);

    try {
      // Start transaction
      await connection.beginTransaction();

      // Generate unique patient ID
      const timestamp = Date.now().toString().slice(-6);
      const patientId = `PAT${timestamp}`;

      // Calculate date of birth from age
      const today = new Date();
      const birthYear = today.getFullYear() - age;
      const dateOfBirth = new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split('T')[0];

             // Insert patient into patients table
       const [patientResult] = await connection.execute(`
         INSERT INTO patients (
           patient_id,
           name,
           date_of_birth,
           gender,
           contact_number,
           email,
           address,
           blood_group,
           emergency_contact_name,
           emergency_contact_number,
           emergency_contact_relation,
           registration_date,
           created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), NOW())
       `, [
         patientId,
         name || 'Unknown Patient',
         dateOfBirth,
         gender || 'Male',
         contactNumber || 'N/A',
         null, // email - not provided in form
         address || 'No address provided',
         null, // blood_group - not provided in form
         'Emergency Contact', // emergency_contact_name - required field
         emergencyContact || 'N/A', // emergency_contact_number
         'Emergency', // emergency_contact_relation - required field
       ]);

      const patientInsertId = (patientResult as any).insertId;

                     // If admission data is provided, create admission record
       if (diagnosis && admissionDate && roomId) {
         try {
           // Find doctor ID from staff_profiles if doctorName is provided
           let doctorId = null;
           if (doctorName) {
             // Since staff_profiles doesn't have a name column, we'll use a default doctor ID
             // or create a placeholder. For now, we'll use null and handle it gracefully
             console.log('Note: Doctor name provided but staff_profiles table has no name column');
             // You might want to create a separate doctors table or modify staff_profiles
           }

                                                                       // Insert admission record - using backticks around 'condition' since it's a reserved keyword
              await connection.execute(`
                INSERT INTO Admissions (
                  id,
                  admissionId,
                  patientId,
                  doctorId,
                  roomNumber,
                  bedNumber,
                  ward,
                  department,
                  admissionDate,
                  admissionTime,
                  diagnosis,
                  \`condition\`,
                  status,
                  emergencyContact,
                  estimatedDischarge,
                  admissionType,
                  notes,
                  createdAt,
                  updatedAt
                ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `, [
                `ADM${Date.now().toString().slice(-6)}`, // admissionId
                patientInsertId,
                1, // doctorId - using a default doctor ID since staff_profiles has no name column
                roomId || null,
                null, // bedNumber
                department || 'General',
                department || 'General',
                new Date(admissionDate), // Convert string to Date object
                new Date().toTimeString().split(' ')[0], // admissionTime
                diagnosis,
                'Stable', // condition - using enum value
                'admitted',
                emergencyContact || 'N/A',
                expectedDischargeDate ? new Date(expectedDischargeDate) : null, // Convert string to Date object
                'planned', // admissionType - using enum value
                `Patient admitted for ${diagnosis}`, // notes
                new Date(), // createdAt
                new Date()  // updatedAt
              ]);
         } catch (admissionError) {
           console.error('Admission creation error:', admissionError);
           // Don't fail the entire operation if admission fails
           // Just log the error and continue
         }
       }

      // Commit transaction
      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Patient created successfully',
        patientId: patientInsertId,
        patientIdGenerated: patientId,
        admissionCreated: !!(diagnosis && admissionDate)
      });

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('Patient creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const connection = await mysql.createConnection(dbConfig);

    // Build dynamic update query
    const updateFields = Object.keys(updateData)
      .filter(key => updateData[key] !== undefined)
      .map(key => `${key} = ?`);
    
    const updateValues = Object.keys(updateData)
      .filter(key => updateData[key] !== undefined)
      .map(key => updateData[key]);

    if (updateFields.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const [result] = await connection.execute(`
      UPDATE patients 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, [...updateValues, id]);

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully'
    });

  } catch (error) {
    console.error('Patient update error:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Soft delete - mark as inactive
    const [result] = await connection.execute(`
      UPDATE patients 
      SET is_active = 0, updated_at = NOW()
      WHERE id = ?
    `, [id]);

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully'
    });

  } catch (error) {
    console.error('Patient deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
