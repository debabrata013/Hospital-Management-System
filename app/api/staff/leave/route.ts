import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-simple';
import LeaveRequest from '@/models/LeaveRequest';

// GET all leave requests for the logged-in user
export async function GET(req: NextRequest) {
  const session = await getServerSession(req);

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leaveRequests = await LeaveRequest.findAll({
      where: { user_id: session.user.id },
      order: [['start_date', 'DESC']],
    });

    return NextResponse.json({ success: true, leaveRequests });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new leave request
export async function POST(req: NextRequest) {
  const session = await getServerSession(req);

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { leave_type, start_date, end_date, reason } = await req.json();

    if (!leave_type || !start_date || !end_date || !reason) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newLeaveRequest = await LeaveRequest.create({
      user_id: session.user.id,
      leave_type,
      start_date,
      end_date,
      reason,
      status: 'Pending',
    });

    return NextResponse.json({ success: true, leaveRequest: newLeaveRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
