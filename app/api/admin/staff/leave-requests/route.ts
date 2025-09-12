import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-simple';
import LeaveRequest from '@/models/LeaveRequest';
import { getConnection } from '@/lib/db/connection';

// GET all leave requests from all staff members for admin view
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
    // Get leave requests with staff names using raw SQL query to join with users table
    const connection = await getConnection();
    const [leaveRequests] = await connection.execute(`
      SELECT 
        lr.id,
        lr.user_id,
        lr.leave_type,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status,
        lr.createdAt as created_at,
        lr.updatedAt as updated_at,
        u.name as staff_name,
        u.contact_number as staff_mobile,
        u.department,
        u.role
      FROM leave_request lr
      JOIN users u ON lr.user_id = u.id
      WHERE u.role IN ('staff', 'doctor', 'nurse', 'receptionist', 'cleaning_staff')
      ORDER BY lr.createdAt DESC
    `);

    return NextResponse.json({ success: true, leaveRequests });
  } catch (error) {
    console.error('Error fetching staff leave requests:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT to update leave request status (approve/reject)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(req);

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin or super-admin
  if (session.user.role !== 'admin' && session.user.role !== 'super-admin') {
    return NextResponse.json({ success: false, error: 'Access denied. Admin privileges required.' }, { status: 403 });
  }

  try {
    const { leave_request_id, status } = await req.json();

    if (!leave_request_id || !status) {
      return NextResponse.json({ success: false, error: 'Leave request ID and status are required' }, { status: 400 });
    }

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status. Must be Approved, Rejected, or Pending' }, { status: 400 });
    }

    const leaveRequest = await LeaveRequest.findByPk(leave_request_id);
    
    if (!leaveRequest) {
      return NextResponse.json({ success: false, error: 'Leave request not found' }, { status: 404 });
    }

    await leaveRequest.update({ status });
    await leaveRequest.reload();

    return NextResponse.json({ success: true, leaveRequest });
  } catch (error) {
    console.error('Error updating leave request status:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
