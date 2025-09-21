import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('auth-backup')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const nurseId = decoded.userId || decoded.id;

    if (!nurseId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Get current date for filtering
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Fetch nurse's schedules (today and upcoming)
    const schedules = await executeQuery(`
      SELECT 
        ns.id,
        ns.shift_date,
        ns.start_time,
        ns.end_time,
        ns.department as ward_assignment,
        ns.shift_type,
        ns.status,
        u.name as nurse_name
      FROM nurse_schedules ns
      LEFT JOIN users u ON ns.nurse_id = u.id
      WHERE ns.nurse_id = ? AND ns.shift_date >= ?
      ORDER BY ns.shift_date ASC, ns.start_time ASC
      LIMIT 10
    `, [nurseId, todayStr]);

    // Get current time in HH:MM format
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    console.log('🕐 Current time:', currentTime);
    console.log('📅 Today date:', todayStr);

    // Get today's schedules and find the one that matches current time
    const todaySchedules = await executeQuery(`
      SELECT 
        ns.id,
        ns.shift_date,
        ns.start_time,
        ns.end_time,
        ns.department as ward_assignment,
        ns.shift_type,
        ns.status
      FROM nurse_schedules ns
      WHERE ns.nurse_id = ? AND ns.shift_date = ?
      ORDER BY ns.start_time ASC
    `, [nurseId, todayStr]) as any[];

    console.log('📋 Today schedules found:', Array.isArray(todaySchedules) ? todaySchedules.length : 0);

    // Find the current active schedule based on time
    let todaySchedule = null;
    let scheduleType = 'none'; // 'current', 'upcoming', 'none'
    
    if (Array.isArray(todaySchedules) && todaySchedules.length > 0) {
      console.log(`🔍 Analyzing ${todaySchedules.length} schedules for current time ${currentTime}`);
      
      // STEP 1: Look for CURRENT active shift (current time is within shift hours)
      todaySchedule = todaySchedules.find((schedule: any) => {
        const startTime = schedule.start_time.slice(0, 5); // HH:MM format
        const endTime = schedule.end_time.slice(0, 5); // HH:MM format
        
        console.log(`⏰ Checking if CURRENT: ${schedule.shift_type} ${startTime} - ${endTime} vs current ${currentTime}`);
        
        let isActive = false;
        // Handle overnight shifts (e.g., 22:00 - 06:00)
        if (startTime > endTime) {
          isActive = currentTime >= startTime || currentTime <= endTime;
        } else {
          isActive = currentTime >= startTime && currentTime <= endTime;
        }
        
        if (isActive) {
          console.log(`✅ FOUND CURRENT ACTIVE SHIFT: ${schedule.shift_type}`);
          scheduleType = 'current';
          return true;
        }
        return false;
      });

      // STEP 2: If no current shift, look for UPCOMING shift today
      if (!todaySchedule) {
        console.log('🔍 No current shift found, looking for upcoming shifts...');
        todaySchedule = todaySchedules.find((schedule: any) => {
          const startTime = schedule.start_time.slice(0, 5);
          const isUpcoming = currentTime < startTime;
          
          console.log(`⏰ Checking if UPCOMING: ${schedule.shift_type} ${startTime} vs current ${currentTime} = ${isUpcoming}`);
          
          if (isUpcoming) {
            console.log(`✅ FOUND UPCOMING SHIFT: ${schedule.shift_type}`);
            scheduleType = 'upcoming';
            return true;
          }
          return false;
        });
      }

      // STEP 3: If no current or upcoming, check if there are any schedules (might be completed)
      if (!todaySchedule && todaySchedules.length > 0) {
        console.log('🔍 No current or upcoming shifts, checking completed shifts...');
        // Find the most recent completed shift
        const completedShifts = todaySchedules.filter((schedule: any) => {
          const endTime = schedule.end_time.slice(0, 5);
          return currentTime > endTime;
        });
        
        if (completedShifts.length > 0) {
          // Get the last completed shift (most recent)
          todaySchedule = completedShifts[completedShifts.length - 1];
          scheduleType = 'completed';
          console.log(`✅ FOUND COMPLETED SHIFT: ${todaySchedule.shift_type}`);
        }
      }

      console.log(`🎯 FINAL RESULT: ${scheduleType.toUpperCase()} - ${todaySchedule ? `${todaySchedule.shift_type} (${todaySchedule.start_time} - ${todaySchedule.end_time})` : 'None'}`);
    } else {
      console.log('❌ No schedules found for today');
    }

    // Filter upcoming schedules to exclude current active shift and past shifts
    let upcomingSchedules = Array.isArray(schedules) ? schedules as any[] : [];

    if (todaySchedule && scheduleType === 'current') {
      // Remove the current active shift from upcoming list
      upcomingSchedules = upcomingSchedules.filter((schedule: any) => 
        !(schedule.id === todaySchedule.id || 
          (schedule.shift_date === todaySchedule.shift_date && 
           schedule.start_time === todaySchedule.start_time &&
           schedule.shift_type === todaySchedule.shift_type))
      );
      
      console.log(`🔄 Filtered out current active shift from upcoming schedules`);
    }
    
    // Also filter out any shifts that have already started or are in the past
    upcomingSchedules = upcomingSchedules.filter((schedule: any) => {
      const scheduleDate = new Date(schedule.shift_date).toISOString().split('T')[0];
      const scheduleStartTime = schedule.start_time.slice(0, 5);
      
      // If it's today, only show shifts that start after current time
      if (scheduleDate === todayStr) {
        const isUpcoming = scheduleStartTime > currentTime;
        console.log(`📅 Checking upcoming: ${schedule.shift_type} ${scheduleStartTime} > ${currentTime} = ${isUpcoming}`);
        return isUpcoming;
      }
      // If it's a future date, include it
      return scheduleDate > todayStr;
    });

    console.log(`📋 Final upcoming schedules: ${upcomingSchedules.length}`);

    return NextResponse.json({
      success: true,
      todaySchedule: todaySchedule,
      scheduleType: scheduleType, // 'current', 'upcoming', 'completed', 'none'
      upcomingSchedules: upcomingSchedules,
      count: upcomingSchedules.length
    });

  } catch (error) {
    console.error('Error fetching nurse schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}
