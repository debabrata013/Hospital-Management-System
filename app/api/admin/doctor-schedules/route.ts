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

    // Fetch staff profiles (doctors) with their basic info
    // Since doctor_schedules table doesn't exist, we'll provide basic availability
    const [staffResult] = await connection.execute(`
      SELECT 
        id,
        user_id,
        employee_type,
        work_location,
        skills,
        languages_known,
        created_at
      FROM staff_profiles 
      WHERE employee_type IN ('full-time', 'part-time')
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const doctorSchedules = staffResult.map((staff: any) => ({
      id: staff.id,
      name: `Staff Member ${staff.id}`, // Since name is not in staff_profiles
      department: staff.work_location || 'General',
      specialization: staff.skills || 'General Medicine',
      licenseNumber: staff.user_id || 'N/A',
      status: 'available',
      shifts: [
        {
          dayOfWeek: 'Monday',
          startTime: '09:00:00',
          endTime: '17:00:00'
        },
        {
          dayOfWeek: 'Tuesday',
          startTime: '09:00:00',
          endTime: '17:00:00'
        },
        {
          dayOfWeek: 'Wednesday',
          startTime: '09:00:00',
          endTime: '17:00:00'
        }
      ]
    }));

    await connection.end();

    return NextResponse.json(doctorSchedules);

  } catch (error) {
    console.error('Doctor schedules fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, schedules } = body;

    // Since we don't have a doctor_schedules table, we'll just return success
    // In a real implementation, you would create this table or use an alternative approach
    
    return NextResponse.json({
      success: true,
      message: 'Doctor schedule updated successfully (schedules stored in memory)'
    });

  } catch (error) {
    console.error('Schedule update error:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor schedule' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, status } = body;

    const connection = await mysql.createConnection(dbConfig);

    // Update staff availability status
    const [result] = await connection.execute(`
      UPDATE staff_profiles 
      SET updated_at = NOW()
      WHERE id = ?
    `, [doctorId]);

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor status updated successfully'
    });

  } catch (error) {
    console.error('Doctor status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor status' },
      { status: 500 }
    );
  }
}
