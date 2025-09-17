import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    // Fetch all nurse assignments with nurse and doctor details
    const assignments = await executeQuery(`
      SELECT 
        na.id,
        na.nurse_id,
        na.doctor_id,
        na.department,
        na.assigned_date,
        na.is_active,
        n.name as nurse_name,
        n.email as nurse_email,
        d.name as doctor_name,
        d.email as doctor_email
      FROM nurse_assignments na
      JOIN users n ON na.nurse_id = n.id
      JOIN users d ON na.doctor_id = d.id
      WHERE na.is_active = 1
      ORDER BY na.assigned_date DESC
    `);

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching nurse assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nurse assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nurse_id, doctor_id, department } = await request.json();

    // Validate required fields
    if (!nurse_id || !doctor_id || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: nurse_id, doctor_id, department' },
        { status: 400 }
      );
    }

    // Validate department
    if (!['opd', 'ward'].includes(department)) {
      return NextResponse.json(
        { error: 'Department must be either "opd" or "ward"' },
        { status: 400 }
      );
    }

    // Check if nurse already has an active assignment
    const existingAssignment = await executeQuery(`
      SELECT id FROM nurse_assignments 
      WHERE nurse_id = ? AND is_active = 1
    `, [nurse_id]) as any[];

    if (existingAssignment && existingAssignment.length > 0) {
      // Deactivate existing assignment
      await executeQuery(`
        UPDATE nurse_assignments 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE nurse_id = ? AND is_active = 1
      `, [nurse_id]);
    }

    // Create new assignment
    const result = await executeQuery(`
      INSERT INTO nurse_assignments (nurse_id, doctor_id, department, assigned_date, is_active)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
    `, [nurse_id, doctor_id, department]) as any;

    return NextResponse.json({
      success: true,
      message: 'Nurse assignment created successfully',
      assignment_id: result.insertId
    });

  } catch (error) {
    console.error('Error creating nurse assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create nurse assignment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { assignment_id, doctor_id, department } = await request.json();

    // Validate required fields
    if (!assignment_id || !doctor_id || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: assignment_id, doctor_id, department' },
        { status: 400 }
      );
    }

    // Validate department
    if (!['opd', 'ward'].includes(department)) {
      return NextResponse.json(
        { error: 'Department must be either "opd" or "ward"' },
        { status: 400 }
      );
    }

    // Update assignment
    await executeQuery(`
      UPDATE nurse_assignments 
      SET doctor_id = ?, department = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_active = 1
    `, [doctor_id, department, assignment_id]);

    return NextResponse.json({
      success: true,
      message: 'Nurse assignment updated successfully'
    });

  } catch (error) {
    console.error('Error updating nurse assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update nurse assignment' },
      { status: 500 }
    );
  }
}
