import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth-middleware'
import { getConnection } from '@/lib/db/connection'
import { isStaticBuild } from '@/lib/api-utils'

// Force dynamic for development
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Handle static builds
  if (isStaticBuild()) {
    return NextResponse.json({
      success: true,
      patients: [
        {
          id: 1,
          patient_id: 'PAT-001',
          name: 'Sample Patient 1',
          date_of_birth: '1990-01-01',
          gender: 'Male',
          blood_group: 'O+',
          contact_number: '9876543210',
          email: 'patient1@example.com',
          address: '123 Sample Street',
          city: 'Sample City',
          state: 'Sample State',
          emergency_contact_name: 'Emergency Contact 1',
          emergency_contact_number: '9876543211',
          is_active: true,
          registration_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          age: 33
        }
      ]
    });
  }

  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_management',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    // Verify authentication using the created connection
    const authResult = await authenticateUser(request, connection);
    if (authResult instanceof NextResponse) {
      await connection.end();
      return authResult;
    }

    const { user } = authResult;

    // Debug: Log user role
    console.log('User role:', user.role)
    console.log('User details:', user)
    
    // Allow all authenticated users for now to debug the issue
    console.log('Allowing access for debugging purposes')

    const [patients] = await connection.execute(
      `SELECT 
        id, patient_id, name, date_of_birth, gender, blood_group, contact_number, 
        email, address, city, state, emergency_contact_name, emergency_contact_number, 
        is_active, registration_date, created_at,
        YEAR(CURDATE()) - YEAR(date_of_birth) - (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(date_of_birth, '%m%d')) AS age
      FROM patients 
      WHERE is_active = TRUE
      ORDER BY name ASC`
    );

    await connection.end();

    console.log('Total patients found:', (patients as any[]).length);
    console.log('Sample patients:', (patients as any[]).slice(0, 3));

    return NextResponse.json({ 
      success: true, 
      patients 
    });
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
