import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-simple';
import Break from '@/models/Break';
import { getConnection } from '@/lib/db/connection';
import { Op } from 'sequelize';
import { startOfDay, endOfDay } from 'date-fns';
import { isStaticBuild, getSearchParams } from '@/lib/api-utils';

// Add dynamic directive to ensure this route is processed server-side during normal operation
export const dynamic = 'force-dynamic';

// GET all breaks from all staff members for admin view
export async function GET(req: NextRequest) {
  // During static build, return mock data
  if (isStaticBuild()) {
    return NextResponse.json({ 
      success: true, 
      breaks: [
        {
          id: 1,
          user_id: 1,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 15 * 60000).toISOString(),
          duration: 15,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          staff_name: 'Staff Member 1',
          staff_mobile: '9876543210',
          department: 'Nursing',
          role: 'staff'
        },
        {
          id: 2,
          user_id: 2,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 30 * 60000).toISOString(),
          duration: 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          staff_name: 'Staff Member 2',
          staff_mobile: '9876543211',
          department: 'Reception',
          role: 'receptionist'
        }
      ]
    });
  }

  const session = await getServerSession(req);

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin or super-admin
  if (session.user.role !== 'admin' && session.user.role !== 'super-admin') {
    return NextResponse.json({ success: false, error: 'Access denied. Admin privileges required.' }, { status: 403 });
  }

  try {
    // Use safe method to get search params
    const searchParams = getSearchParams(req, { date: new Date().toISOString().split('T')[0] });
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
