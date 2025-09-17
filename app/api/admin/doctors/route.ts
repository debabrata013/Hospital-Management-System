import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Fetch all active doctors from the database
    const doctors = await executeQuery(`
      SELECT 
        id,
        name,
        email,
        specialization,
        department,
        qualification,
        experience_years,
        license_number,
        employee_id,
        is_active
      FROM users 
      WHERE role = 'doctor' 
      AND is_active = 1
      ORDER BY name ASC
    `, []) as any[]

    return NextResponse.json({
      success: true,
      count: doctors.length,
      doctors: doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization || 'General Medicine',
        department: doctor.department || 'General',
        qualification: doctor.qualification,
        experience_years: doctor.experience_years,
        license_number: doctor.license_number,
        employee_id: doctor.employee_id,
        is_active: doctor.is_active
      }))
    })

  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch doctors',
        doctors: [] 
      },
      { status: 500 }
    )
  }
}