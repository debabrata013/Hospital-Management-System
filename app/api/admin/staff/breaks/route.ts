import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-simple';
import Break from '@/models/Break';
import { getConnection } from '@/lib/db/connection';
import { Op } from 'sequelize';
import { startOfDay, endOfDay } from 'date-fns';

// GET all breaks from all staff members for admin view
export async function GET(req: NextRequest) {
  const session = await getServerSession(req);

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin or super-admin
  if (session.user.role !== 'admin' && session.user.role !== 'super-admin') {
    return NextResponse.json({ success: false, error: 'Access denied. Admin privileges required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dateFilter = searchParams.get('date'); // Optional date filter (YYYY-MM-DD format)
    
    let whereClause = '';
    let queryParams: any[] = [];

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      whereClause = `AND b.start_time BETWEEN ? AND ?`;
      queryParams = [startOfDay(filterDate), endOfDay(filterDate)];
    } else {
      // Default to today's breaks
      const today = new Date();
      whereClause = `AND b.start_time BETWEEN ? AND ?`;
      queryParams = [startOfDay(today), endOfDay(today)];
    }

    // Get breaks with staff names using raw SQL query to join with users table
    const connection = await getConnection();
    const [breaks] = await connection.execute(`
      SELECT 
        b.id,
        b.user_id,
        b.start_time,
        b.end_time,
        b.duration,
        b.created_at,
        b.updated_at,
        u.name as staff_name,
        u.contact_number as staff_mobile,
        u.department,
        u.role
      FROM breaks b
      JOIN users u ON b.user_id = u.id
      WHERE u.role IN ('staff', 'doctor', 'nurse', 'receptionist', 'cleaning_staff')
      ${whereClause}
      ORDER BY b.start_time DESC
    `, queryParams);

    return NextResponse.json({ success: true, breaks });
  } catch (error) {
    console.error('Error fetching staff breaks:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
