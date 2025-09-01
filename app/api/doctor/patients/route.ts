import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db/connection';
import { getLoggedInUserId } from '../../../../lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search query parameter if provided
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = `
      SELECT
        p.id,
        p.name,
        p.date_of_birth as dateOfBirth,
        p.contact_number as phone,
        p.email,
        p.address,
        p.gender,
        p.created_at,
        appt_summary.totalAppointments,
        appt_summary.lastVisit
      FROM 
        patients p
      LEFT JOIN (
        SELECT
          patient_id as patientId,
          COUNT(id) as totalAppointments,
          MAX(appointment_date) as lastVisit
        FROM appointments
        WHERE doctor_id = ?
        GROUP BY patient_id
      ) as appt_summary ON p.id = appt_summary.patientId
    `;

    const queryParams: (string | number)[] = [userId];

    // Add search functionality
    if (search) {
      query += ` WHERE (
        p.name LIKE ? OR 
        p.contact_number LIKE ? OR 
        p.email LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += `
      ORDER BY p.name ASC
      LIMIT ?
    `;
    queryParams.push(limit);

    const patientsData: any = await executeQuery(query, queryParams);

    const patients = patientsData.map((patient: any) => {
      const [firstName, ...lastNameParts] = patient.name.split(' ');
      const lastName = lastNameParts.join(' ');
      return {
        id: patient.id,
        firstName: firstName || '',
        lastName: lastName || '',
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        age: patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : null,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        gender: patient.gender,
        totalAppointments: patient.totalAppointments || 0,
        lastVisit: patient.lastVisit,
        createdAt: patient.created_at,
      };
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      dateOfBirth, 
      phone, 
      email, 
      address, 
      gender,
      emergencyContact,
      medicalHistory 
    } = body;

    if (!firstName || !lastName) {
        return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    const name = `${firstName} ${lastName}`.trim();

    // Insert new patient
    const insertQuery = `
      INSERT INTO patients (
        name, 
        date_of_birth, 
        contact_number, 
        email, 
        address, 
        gender,
        emergency_contact,
        medical_history,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const result: any = await executeQuery(insertQuery, [
      name,
      dateOfBirth,
      phone,
      email,
      address,
      gender,
      emergencyContact,
      medicalHistory
    ]);

    // Get the created patient
    const getPatientQuery = `
      SELECT * FROM patients WHERE id = ?
    `;

    const patientData: any = await executeQuery(getPatientQuery, [result.insertId]);
    const newPatient = patientData[0];

    const [fName, ...lNameParts] = newPatient.name.split(' ');
    const lName = lNameParts.join(' ');

    const response = {
      id: newPatient.id,
      firstName: fName,
      lastName: lName,
      name: newPatient.name,
      dateOfBirth: newPatient.date_of_birth,
      age: newPatient.date_of_birth ? new Date().getFullYear() - new Date(newPatient.date_of_birth).getFullYear() : null,
      phone: newPatient.contact_number,
      email: newPatient.email,
      address: newPatient.address,
      gender: newPatient.gender,
      emergencyContact: newPatient.emergency_contact,
      medicalHistory: newPatient.medical_history,
      createdAt: newPatient.created_at,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
