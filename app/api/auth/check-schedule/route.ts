import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber } = await request.json();

    if (!mobileNumber) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const users = await executeQuery('SELECT id, role FROM users WHERE phone_number = ?', [mobileNumber]) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    if (user.role !== 'nurse') {
      return NextResponse.json({ allowLogin: true });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    const schedules = await executeQuery(
      `SELECT start_time, end_time FROM nurse_schedules WHERE nurse_id = ? AND (shift_date = ? OR (? BETWEEN start_date AND end_date)) AND status = 'active'`,
      [user.id, todayStr, todayStr]
    ) as any[];

    if (schedules.length === 0) {
      return NextResponse.json({ allowLogin: false, message: 'No active shift scheduled for today.' });
    }

    const isOnShift = schedules.some(schedule => {
      const startTime = schedule.start_time.slice(0, 5);
      const endTime = schedule.end_time.slice(0, 5);
      return currentTime >= startTime && currentTime <= endTime;
    });

    if (!isOnShift) {
      return NextResponse.json({ allowLogin: false, message: 'You can only log in during your scheduled shift.' });
    }

    return NextResponse.json({ allowLogin: true });

  } catch (error) {
    console.error('Error checking schedule:', error);
    return NextResponse.json({ error: 'Failed to check schedule' }, { status: 500 });
  }
}
