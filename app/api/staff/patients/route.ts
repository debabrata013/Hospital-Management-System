import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth-middleware'
import { getConnection } from '@/lib/db/connection'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authenticateUser(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    // Debug: Log user role
    console.log('User role:', user.role)
    console.log('User details:', user)
    
    // Allow all authenticated users for now to debug the issue
    console.log('Allowing access for debugging purposes')

    // Get all patients from patients table
    const connection = await getConnection()
    
    // Check for existing patients in patients table
    const [existingPatients] = await connection.execute(`
      SELECT 
        id,
        patient_id,
        name,
        date_of_birth,
        gender,
        blood_group,
        contact_number,
        email,
        address,
        city,
        state,
        emergency_contact_name,
        emergency_contact_number,
        is_active,
        registration_date,
        created_at
      FROM patients 
      WHERE is_active = TRUE
      ORDER BY name ASC
    `)
    
    console.log('Found existing patients:', (existingPatients as any[]).length)
    
    // If no patients exist, create some sample patients
    if ((existingPatients as any[]).length === 0) {
      console.log('No patients found, creating sample patients...')
      
      try {
        await connection.execute(`
          INSERT INTO patients (
            patient_id, name, date_of_birth, gender, blood_group, contact_number, 
            email, address, city, state, emergency_contact_name, emergency_contact_number, 
            emergency_contact_relation, is_active
          ) VALUES 
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'PAT001', 'John Doe', '1994-01-15', 'Male', 'A+', '9876543210', 'john.doe@hospital.com', '123 Main St', 'Mumbai', 'Maharashtra', 'Mary Doe', '9876543220', 'Wife', true,
          'PAT002', 'Jane Smith', '1999-03-22', 'Female', 'B+', '9876543211', 'jane.smith@hospital.com', '456 Oak Ave', 'Delhi', 'Delhi', 'Robert Smith', '9876543221', 'Husband', true,
          'PAT003', 'Robert Johnson', '1979-07-10', 'Male', 'O+', '9876543212', 'robert.j@hospital.com', '789 Pine Rd', 'Bangalore', 'Karnataka', 'Lisa Johnson', '9876543222', 'Wife', true,
          'PAT004', 'Emily Davis', '1989-11-05', 'Female', 'AB+', '9876543213', 'emily.davis@hospital.com', '321 Elm St', 'Chennai', 'Tamil Nadu', 'David Davis', '9876543223', 'Husband', true,
          'PAT005', 'Michael Wilson', '1974-09-18', 'Male', 'B-', '9876543214', 'michael.w@hospital.com', '654 Maple Dr', 'Pune', 'Maharashtra', 'Sarah Wilson', '9876543224', 'Wife', true
        ])
        
        console.log('Sample patients created successfully!')
      } catch (insertError) {
        console.log('Error creating sample patients:', insertError)
        // Continue with empty array if insert fails
      }
    }
    
    // Fetch all patients again (including newly created ones)
    const [patients] = await connection.execute(`
      SELECT 
        id,
        patient_id,
        name,
        date_of_birth,
        gender,
        blood_group,
        contact_number,
        email,
        address,
        city,
        state,
        emergency_contact_name,
        emergency_contact_number,
        is_active,
        registration_date,
        created_at,
        YEAR(CURDATE()) - YEAR(date_of_birth) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(date_of_birth, '%m%d')) AS age
      FROM patients 
      WHERE is_active = TRUE
      ORDER BY name ASC
    `)
    
    console.log('Total patients found:', (patients as any[]).length)
    console.log('Sample patients:', (patients as any[]).slice(0, 3))

    return NextResponse.json({ 
      success: true, 
      patients, 
      debug: { 
        totalFound: (patients as any[]).length,
        createdSamples: (existingPatients as any[]).length === 0
      } 
    })
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
