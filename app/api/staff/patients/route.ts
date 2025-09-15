
import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth-middleware'

// Force dynamic for development to ensure fresh data on each request
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  let connection;
  try {
    console.log('Attempting to connect to the database...');
    const mysql = require('mysql2/promise');
    // Establish database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'srv2047.hstgr.io',
      user: process.env.DB_USER || 'u153229971_admin',
      password: process.env.DB_PASSWORD || 'Admin!2025',
      database: process.env.DB_NAME || 'u153229971_Hospital',
      port: parseInt(process.env.DB_PORT || '3306'),
    });
    console.log('✅ Database connection successful.');

    // Verify user authentication
    const authResult = await authenticateUser(request, connection);
    if (authResult instanceof NextResponse) {
      console.error('❌ Authentication failed.');
      return authResult;
    }

    const { user } = authResult;
    console.log(`✅ User authenticated: ${user.role}`);

    console.log('Executing query to fetch all active patients...');
    const [patients] = await connection.execute(
      `SELECT 
        p.id,
        p.patient_id,
        p.name,
        p.contact_number,
        p.age,
        p.gender,
        p.blood_group
      FROM 
        patients p
      WHERE 
        p.is_active = TRUE
      ORDER BY 
        p.name ASC`
    );

    console.log(`✅ Query executed. Found ${ (patients as any[]).length } patients.`);
    if ((patients as any[]).length > 0) {
        console.log('Sample patient data:', (patients as any[])[0]);
    }

    // Return the list of patients
    return NextResponse.json({ 
      success: true, 
      patients 
    });

  } catch (error) {
    console.error('❌ An error occurred in GET /api/staff/patients:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}
