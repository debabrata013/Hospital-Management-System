import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { dbConfig } from '@/lib/db/config';

export const dynamic = 'force-dynamic';

async function getScheduleColumnInfo(connection: mysql.Connection) {
  try {
    const [columns] = await connection.execute('DESCRIBE nurse_schedules') as any[];
    const names = new Set(columns.map((c: any) => c.Field));
    return {
      hasWardAssignment: names.has('ward_assignment'),
      hasDepartment: names.has('department'),
      hasMaxPatients: names.has('max_patients'),
      hasCurrentPatients: names.has('current_patients'),
    };
  } catch (e) {
    return {
      hasWardAssignment: false,
      hasDepartment: true,
      hasMaxPatients: false,
      hasCurrentPatients: false,
    };
  }
}

// GET - Fetch all nurse schedules
export async function GET(request: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const cols = await getScheduleColumnInfo(connection);
    const wardSelect = cols.hasWardAssignment
      ? 'ns.ward_assignment as ward_assignment'
      : (cols.hasDepartment ? 'ns.department as ward_assignment' : `"General Ward" as ward_assignment`);
    const maxPatientsSelect = cols.hasMaxPatients ? 'ns.max_patients as max_patients' : '8 as max_patients';
    const currentPatientsSelect = cols.hasCurrentPatients ? 'ns.current_patients as current_patients' : '0 as current_patients';

    const [schedules] = await connection.execute(
      `SELECT 
        ns.id,
        ns.nurse_id,
        u.name as nurse_name,
        ns.shift_date,
        ns.start_date,
        ns.end_date,
        ns.start_time,
        ns.end_time,
        ${wardSelect},
        ns.shift_type,
        ns.status,
        ${maxPatientsSelect},
        ${currentPatientsSelect},
        ns.created_at,
        ns.updated_at
      FROM nurse_schedules ns
      LEFT JOIN users u ON ns.nurse_id = u.id
      WHERE u.role = 'nurse'
      ORDER BY ns.shift_date DESC, ns.start_date DESC, ns.start_time ASC`
    );

    return NextResponse.json({
      success: true,
      count: (schedules as any[]).length,
      schedules: schedules
    });

  } catch (error) {
    console.error('Error fetching nurse schedules:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch nurse schedules',
        schedules: [] 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Create new nurse schedule
export async function POST(request: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const body = await request.json();
    const { nurseId, date, startDate, endDate, startTime, endTime, wardAssignment, shiftType, maxPatients } = body;

    const effectiveStart = startDate || date;
    const effectiveEnd = endDate || date;

    if (!nurseId || !effectiveStart || !effectiveEnd || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (effectiveStart > effectiveEnd) {
      return NextResponse.json(
        { error: 'End date must be on or after start date' },
        { status: 400 }
      );
    }

    const [nurseCheck] = await connection.execute(
      'SELECT id, name FROM users WHERE id = ? AND role = "nurse"',
      [nurseId]
    ) as any[];

    if (!nurseCheck || nurseCheck.length === 0) {
      return NextResponse.json(
        { error: 'Nurse not found' },
        { status: 404 }
      );
    }

    const cols = await getScheduleColumnInfo(connection);
    const wardColumn = cols.hasWardAssignment ? 'ward_assignment' : (cols.hasDepartment ? 'department' : null);
    const includeMaxPatients = cols.hasMaxPatients;

    const dates: string[] = [];
    const start = new Date(effectiveStart);
    const end = new Date(effectiveEnd);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    let createdCount = 0;
    let skippedCount = 0;
    const createdIds: number[] = [];
    const conflicts: Array<{ date: string; reason: string }> = [];

    for (const day of dates) {
      const [conflictCheck] = await connection.execute(
        `SELECT id, shift_type, start_time, end_time FROM nurse_schedules 
         WHERE nurse_id = ? AND shift_date = ? 
         AND LOWER(status) != 'cancelled'`,
        [nurseId, day]
      ) as any[];

      if (conflictCheck && conflictCheck.length > 0) {
        const overlap = conflictCheck.find((schedule: any) => {
          const existingStart = schedule.start_time.slice(0, 5);
          const existingEnd = schedule.end_time.slice(0, 5);
          return (startTime < existingEnd && endTime > existingStart);
        });
        if (overlap) {
          skippedCount++;
          conflicts.push({ date: day, reason: `Overlaps with ${overlap.shift_type} ${overlap.start_time}-${overlap.end_time}` });
          continue;
        }
      }

      const colsArr: string[] = ['nurse_id', 'shift_date', 'start_time', 'end_time', 'shift_type', 'status', 'created_at'];
      const placeholders: string[] = ['?', '?', '?', '?', '?', '"Scheduled"', 'NOW()'];
      const [nurseDetails] = await connection.execute('SELECT department FROM users WHERE id = ?', [nurseId]) as any[];
      const finalWardAssignment = wardAssignment || (nurseDetails[0] as any)?.department || 'General Ward';
      const values: any[] = [nurseId, day, startTime, endTime, shiftType];
      if (wardColumn) {
        colsArr.splice(4, 0, wardColumn);
        placeholders.splice(4, 0, '?');
        values.splice(4, 0, finalWardAssignment);
      }
      if (includeMaxPatients) {
        colsArr.splice(colsArr.length - 2, 0, 'max_patients');
        placeholders.splice(placeholders.length - 2, 0, '?');
        values.splice(values.length, 0, maxPatients || 8);
      }

      const insertSQL = `INSERT INTO nurse_schedules (${colsArr.join(', ')}) VALUES (${placeholders.join(', ')})`;
      const [insertResult] = await connection.execute(insertSQL, values) as any[];

      if ((insertResult as any).insertId) {
        createdCount++;
        createdIds.push((insertResult as any).insertId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdCount} schedule(s)${skippedCount ? `, skipped ${skippedCount} due to conflicts` : ''}`,
      createdCount,
      skippedCount,
      createdIds,
      conflicts
    });

  } catch (error: any) {
    console.error('Error creating nurse schedule:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { 
          error: 'Database constraint prevents double shifts.' 
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create nurse schedule. Please try again.' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}