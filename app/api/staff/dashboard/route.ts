import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import StaffProfile from '@/models/StaffProfile';
import StaffShift from '@/models/StaffShift';
import LeaveRequest from '@/models/LeaveRequest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/staff/dashboard - Get staff dashboard data and analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dashboardType = searchParams.get('type') || 'overview';
    const department = searchParams.get('department');
    const dateRange = searchParams.get('dateRange') || '30'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));
    const endDate = new Date();

    let dashboardData: any = {};

    if (dashboardType === 'overview' || dashboardType === 'all') {
      // Staff Overview Statistics
      const staffStats = await getStaffOverviewStats(department);
      dashboardData.staffOverview = staffStats;
    }

    if (dashboardType === 'attendance' || dashboardType === 'all') {
      // Attendance Statistics
      const attendanceStats = await getAttendanceStats(startDate, endDate, department);
      dashboardData.attendance = attendanceStats;
    }

    if (dashboardType === 'leaves' || dashboardType === 'all') {
      // Leave Statistics
      const leaveStats = await getLeaveStats(startDate, endDate, department);
      dashboardData.leaves = leaveStats;
    }

    if (dashboardType === 'shifts' || dashboardType === 'all') {
      // Shift Statistics
      const shiftStats = await getShiftStats(startDate, endDate, department);
      dashboardData.shifts = shiftStats;
    }

    if (dashboardType === 'performance' || dashboardType === 'all') {
      // Performance Metrics
      const performanceStats = await getPerformanceStats(startDate, endDate, department);
      dashboardData.performance = performanceStats;
    }

    if (dashboardType === 'alerts' || dashboardType === 'all') {
      // Important Alerts and Notifications
      const alerts = await getStaffAlerts(department);
      dashboardData.alerts = alerts;
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      generatedAt: new Date().toISOString(),
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: parseInt(dateRange)
      }
    });

  } catch (error) {
    console.error('Error fetching staff dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get staff overview statistics
async function getStaffOverviewStats(department?: string) {
  const matchCondition: any = {};
  if (department) {
    matchCondition.department = department;
  }

  const pipeline = [
    {
      $lookup: {
        from: 'staffprofiles',
        localField: '_id',
        foreignField: 'userId',
        as: 'profile'
      }
    },
    {
      $match: {
        role: { $in: ['doctor', 'staff', 'admin', 'receptionist'] },
        isActive: true,
        ...matchCondition
      }
    },
    {
      $group: {
        _id: null,
        totalStaff: { $sum: 1 },
        activeStaff: { 
          $sum: { $cond: [{ $eq: ['$availability', true] }, 1, 0] }
        },
        doctorCount: { 
          $sum: { $cond: [{ $eq: ['$role', 'doctor'] }, 1, 0] }
        },
        staffCount: { 
          $sum: { $cond: [{ $eq: ['$role', 'staff'] }, 1, 0] }
        },
        adminCount: { 
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
        },
        receptionistCount: { 
          $sum: { $cond: [{ $eq: ['$role', 'receptionist'] }, 1, 0] }
        },
        departmentDistribution: { $push: '$department' },
        currentStatusDistribution: { $push: '$currentStatus' }
      }
    }
  ];

  const result = await User.aggregate(pipeline);
  const stats = result[0] || {
    totalStaff: 0,
    activeStaff: 0,
    doctorCount: 0,
    staffCount: 0,
    adminCount: 0,
    receptionistCount: 0,
    departmentDistribution: [],
    currentStatusDistribution: []
  };

  // Process department distribution
  const departmentCounts = stats.departmentDistribution.reduce((acc: any, dept: string) => {
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Process status distribution
  const statusCounts = stats.currentStatusDistribution.reduce((acc: any, status: string) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalStaff: stats.totalStaff,
    activeStaff: stats.activeStaff,
    inactiveStaff: stats.totalStaff - stats.activeStaff,
    roleDistribution: {
      doctors: stats.doctorCount,
      staff: stats.staffCount,
      admins: stats.adminCount,
      receptionists: stats.receptionistCount
    },
    departmentDistribution: departmentCounts,
    statusDistribution: statusCounts
  };
}

// Helper function to get attendance statistics
async function getAttendanceStats(startDate: Date, endDate: Date, department?: string) {
  const matchCondition: any = {
    shiftDate: { $gte: startDate, $lte: endDate }
  };
  
  if (department) {
    matchCondition.department = department;
  }

  const pipeline = [
    { $match: matchCondition },
    {
      $lookup: {
        from: 'users',
        localField: 'staffId',
        foreignField: '_id',
        as: 'staff'
      }
    },
    { $unwind: '$staff' },
    {
      $group: {
        _id: null,
        totalShifts: { $sum: 1 },
        completedShifts: { 
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        noShowShifts: { 
          $sum: { $cond: [{ $eq: ['$status', 'No Show'] }, 1, 0] }
        },
        cancelledShifts: { 
          $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
        },
        totalHoursWorked: { $sum: '$attendance.totalHours' },
        totalOvertimeHours: { $sum: '$attendance.overtimeHours' },
        averageHoursPerShift: { $avg: '$attendance.totalHours' },
        punctualityRate: {
          $avg: {
            $cond: [
              { $eq: ['$performance.punctuality', 'Excellent'] }, 100,
              { $cond: [
                { $eq: ['$performance.punctuality', 'Good'] }, 80,
                { $cond: [
                  { $eq: ['$performance.punctuality', 'Average'] }, 60, 40
                ]}
              ]}
            ]
          }
        }
      }
    }
  ];

  const result = await StaffShift.aggregate(pipeline);
  const stats = result[0] || {
    totalShifts: 0,
    completedShifts: 0,
    noShowShifts: 0,
    cancelledShifts: 0,
    totalHoursWorked: 0,
    totalOvertimeHours: 0,
    averageHoursPerShift: 0,
    punctualityRate: 0
  };

  const attendanceRate = stats.totalShifts > 0 ? 
    ((stats.completedShifts / stats.totalShifts) * 100).toFixed(2) : 0;

  return {
    ...stats,
    attendanceRate: parseFloat(attendanceRate),
    absenteeismRate: stats.totalShifts > 0 ? 
      ((stats.noShowShifts / stats.totalShifts) * 100).toFixed(2) : 0
  };
}

// Helper function to get leave statistics
async function getLeaveStats(startDate: Date, endDate: Date, department?: string) {
  const pipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'staffId',
        foreignField: '_id',
        as: 'staff'
      }
    },
    { $unwind: '$staff' },
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        ...(department && { 'staff.department': department })
      }
    },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        approvedRequests: { 
          $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
        },
        rejectedRequests: { 
          $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
        },
        pendingRequests: { 
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
        },
        totalLeaveDays: { $sum: '$totalDays' },
        averageLeaveDays: { $avg: '$totalDays' },
        leaveTypeDistribution: { $push: '$leaveType' },
        urgencyDistribution: { $push: '$urgency' }
      }
    }
  ];

  const result = await LeaveRequest.aggregate(pipeline);
  const stats = result[0] || {
    totalRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    pendingRequests: 0,
    totalLeaveDays: 0,
    averageLeaveDays: 0,
    leaveTypeDistribution: [],
    urgencyDistribution: []
  };

  // Process leave type distribution
  const leaveTypeCounts = stats.leaveTypeDistribution.reduce((acc: any, type: string) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Process urgency distribution
  const urgencyCounts = stats.urgencyDistribution.reduce((acc: any, urgency: string) => {
    acc[urgency] = (acc[urgency] || 0) + 1;
    return acc;
  }, {});

  const approvalRate = stats.totalRequests > 0 ? 
    ((stats.approvedRequests / stats.totalRequests) * 100).toFixed(2) : 0;

  return {
    ...stats,
    approvalRate: parseFloat(approvalRate),
    leaveTypeDistribution: leaveTypeCounts,
    urgencyDistribution: urgencyCounts
  };
}

// Helper function to get shift statistics
async function getShiftStats(startDate: Date, endDate: Date, department?: string) {
  const matchCondition: any = {
    shiftDate: { $gte: startDate, $lte: endDate }
  };
  
  if (department) {
    matchCondition.department = department;
  }

  const pipeline = [
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalShifts: { $sum: 1 },
        morningShifts: { 
          $sum: { $cond: [{ $eq: ['$shiftType', 'Morning'] }, 1, 0] }
        },
        eveningShifts: { 
          $sum: { $cond: [{ $eq: ['$shiftType', 'Evening'] }, 1, 0] }
        },
        nightShifts: { 
          $sum: { $cond: [{ $eq: ['$shiftType', 'Night'] }, 1, 0] }
        },
        emergencyShifts: { 
          $sum: { $cond: [{ $eq: ['$shiftType', 'Emergency'] }, 1, 0] }
        },
        averageTaskCompletion: { $avg: '$performance.productivity.completionRate' },
        departmentDistribution: { $push: '$department' }
      }
    }
  ];

  const result = await StaffShift.aggregate(pipeline);
  const stats = result[0] || {
    totalShifts: 0,
    morningShifts: 0,
    eveningShifts: 0,
    nightShifts: 0,
    emergencyShifts: 0,
    averageTaskCompletion: 0,
    departmentDistribution: []
  };

  // Process department distribution
  const departmentCounts = stats.departmentDistribution.reduce((acc: any, dept: string) => {
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  return {
    ...stats,
    shiftTypeDistribution: {
      Morning: stats.morningShifts,
      Evening: stats.eveningShifts,
      Night: stats.nightShifts,
      Emergency: stats.emergencyShifts
    },
    departmentDistribution: departmentCounts
  };
}

// Helper function to get performance statistics
async function getPerformanceStats(startDate: Date, endDate: Date, department?: string) {
  // This would typically involve more complex calculations
  // For now, returning mock data structure
  return {
    averagePerformanceRating: 4.2,
    topPerformers: [],
    performanceDistribution: {
      excellent: 25,
      good: 45,
      average: 25,
      poor: 5
    },
    trainingCompletionRate: 78.5,
    certificationRenewalsDue: 12
  };
}

// Helper function to get staff alerts
async function getStaffAlerts(department?: string) {
  const alerts = [];

  // Get upcoming birthdays (next 7 days)
  const upcomingBirthdays = await StaffProfile.findUpcomingBirthdays(7);
  if (upcomingBirthdays.length > 0) {
    alerts.push({
      type: 'BIRTHDAYS',
      priority: 'LOW',
      title: 'Upcoming Birthdays',
      message: `${upcomingBirthdays.length} staff members have birthdays this week`,
      count: upcomingBirthdays.length,
      data: upcomingBirthdays
    });
  }

  // Get expiring certifications (next 30 days)
  const expiringCertifications = await StaffProfile.findExpiringCertifications(30);
  if (expiringCertifications.length > 0) {
    alerts.push({
      type: 'CERTIFICATIONS',
      priority: 'HIGH',
      title: 'Expiring Certifications',
      message: `${expiringCertifications.length} certifications expiring soon`,
      count: expiringCertifications.length,
      data: expiringCertifications
    });
  }

  // Get pending leave approvals
  const pendingLeaves = await LeaveRequest.find({
    status: 'Pending',
    urgency: { $in: ['High', 'Emergency'] }
  }).populate('staffId', 'name employeeId department').limit(10);

  if (pendingLeaves.length > 0) {
    alerts.push({
      type: 'LEAVE_APPROVALS',
      priority: 'MEDIUM',
      title: 'Pending Leave Approvals',
      message: `${pendingLeaves.length} urgent leave requests pending approval`,
      count: pendingLeaves.length,
      data: pendingLeaves
    });
  }

  // Get today's no-shows
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayNoShows = await StaffShift.find({
    shiftDate: { $gte: today, $lt: tomorrow },
    status: 'No Show'
  }).populate('staffId', 'name employeeId department');

  if (todayNoShows.length > 0) {
    alerts.push({
      type: 'NO_SHOWS',
      priority: 'HIGH',
      title: 'Today\'s No-Shows',
      message: `${todayNoShows.length} staff members didn't show up for their shifts today`,
      count: todayNoShows.length,
      data: todayNoShows
    });
  }

  return alerts;
}
