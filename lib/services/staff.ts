import User from '@/models/User';
import StaffProfile from '@/models/StaffProfile';
import StaffShift from '@/models/StaffShift';
import LeaveRequest from '@/models/LeaveRequest';
import { NotificationService } from './notification';

export class StaffService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  // ==================== STAFF PROFILE MANAGEMENT ====================

  async createStaffProfile(profileData: any, createdBy: string) {
    try {
      // Check if profile already exists
      const existingProfile = await StaffProfile.findOne({ userId: profileData.userId });
      if (existingProfile) {
        throw new Error('Staff profile already exists for this user');
      }

      // Verify user exists and is staff
      const user = await User.findById(profileData.userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!['doctor', 'staff', 'admin', 'receptionist'].includes(user.role)) {
        throw new Error('Profile can only be created for staff members');
      }

      const profile = new StaffProfile({
        ...profileData,
        createdBy,
        lastUpdatedBy: createdBy
      });

      await profile.save();

      // Log audit trail
      await this.logAuditTrail({
        action: 'CREATE_STAFF_PROFILE',
        entityType: 'STAFF_PROFILE',
        entityId: profile._id.toString(),
        userId: createdBy,
        details: {
          staffId: profileData.userId,
          department: profileData.currentAssignment?.department,
          employmentStatus: profile.employmentStatus
        },
        riskLevel: 'LOW'
      });

      return await StaffProfile.findById(profile._id).populate('userId', 'name employeeId role email contactNumber');
    } catch (error) {
      console.error('Error creating staff profile:', error);
      throw new Error(error.message || 'Failed to create staff profile');
    }
  }

  async updateStaffProfile(profileId: string, updates: any, updatedBy: string) {
    try {
      const profile = await StaffProfile.findById(profileId);
      if (!profile) {
        throw new Error('Staff profile not found');
      }

      // Store original values for audit
      const originalValues = {
        employmentStatus: profile.employmentStatus,
        currentAssignment: profile.currentAssignment,
        personalInfo: profile.personalInfo
      };

      Object.assign(profile, updates);
      profile.lastUpdatedBy = updatedBy;
      await profile.save();

      // Log audit trail
      await this.logAuditTrail({
        action: 'UPDATE_STAFF_PROFILE',
        entityType: 'STAFF_PROFILE',
        entityId: profileId,
        userId: updatedBy,
        details: {
          originalValues,
          updatedValues: updates
        },
        riskLevel: 'MEDIUM'
      });

      return await StaffProfile.findById(profileId).populate('userId', 'name employeeId role email contactNumber');
    } catch (error) {
      console.error('Error updating staff profile:', error);
      throw new Error(error.message || 'Failed to update staff profile');
    }
  }

  async getStaffProfiles(queryParams: any) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        department,
        role,
        employmentStatus,
        sortBy = 'name',
        sortOrder = 'asc'
      } = queryParams;

      const skip = (page - 1) * limit;
      
      // Build aggregation pipeline
      const pipeline: any[] = [
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' }
      ];

      // Build match conditions
      const matchConditions: any = {};

      if (search) {
        matchConditions.$or = [
          { 'user.name': { $regex: search, $options: 'i' } },
          { 'user.employeeId': { $regex: search, $options: 'i' } },
          { 'user.email': { $regex: search, $options: 'i' } }
        ];
      }

      if (department) {
        matchConditions['user.department'] = department;
      }

      if (role) {
        matchConditions['user.role'] = role;
      }

      if (employmentStatus) {
        matchConditions.employmentStatus = employmentStatus;
      }

      if (Object.keys(matchConditions).length > 0) {
        pipeline.push({ $match: matchConditions });
      }

      // Add sorting
      const sortField = sortBy === 'name' ? 'user.name' : 
                       sortBy === 'employeeId' ? 'user.employeeId' :
                       sortBy === 'department' ? 'user.department' :
                       sortBy === 'joiningDate' ? 'user.employment.joiningDate' :
                       sortBy;

      pipeline.push({ $sort: { [sortField]: sortOrder === 'desc' ? -1 : 1 } });

      // Add pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      // Project final structure
      pipeline.push({
        $project: {
          _id: 1,
          userId: '$user._id',
          name: '$user.name',
          employeeId: '$user.employeeId',
          role: '$user.role',
          department: '$user.department',
          email: '$user.email',
          contactNumber: '$user.contactNumber',
          employmentStatus: 1,
          personalInfo: 1,
          currentAssignment: 1,
          age: 1,
          totalExperience: 1,
          createdAt: 1,
          updatedAt: 1
        }
      });

      const [profiles, totalCount] = await Promise.all([
        StaffProfile.aggregate(pipeline),
        this.getStaffProfilesCount(matchConditions)
      ]);

      return {
        profiles,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching staff profiles:', error);
      throw new Error('Failed to fetch staff profiles');
    }
  }

  private async getStaffProfilesCount(matchConditions: any) {
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ];

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    pipeline.push({ $count: 'total' });

    const result = await StaffProfile.aggregate(pipeline);
    return result[0]?.total || 0;
  }

  async getStaffProfileById(profileId: string) {
    try {
      const profile = await StaffProfile.findById(profileId)
        .populate('userId', 'name employeeId role department email contactNumber employment')
        .populate('currentAssignment.supervisor', 'name employeeId')
        .populate('performanceReviews.reviewedBy', 'name')
        .populate('disciplinaryActions.actionBy', 'name')
        .populate('createdBy', 'name')
        .populate('lastUpdatedBy', 'name');

      if (!profile) {
        throw new Error('Staff profile not found');
      }

      return profile;
    } catch (error) {
      console.error('Error fetching staff profile:', error);
      throw new Error('Failed to fetch staff profile');
    }
  }

  // ==================== SHIFT MANAGEMENT ====================

  async createShift(shiftData: any, createdBy: string) {
    try {
      // Verify staff exists
      const staff = await User.findById(shiftData.staffId);
      if (!staff) {
        throw new Error('Staff member not found');
      }

      // Check for shift conflicts
      const conflictingShift = await this.checkShiftConflict(
        shiftData.staffId,
        shiftData.shiftDate,
        shiftData.startTime,
        shiftData.endTime
      );

      if (conflictingShift) {
        throw new Error('Staff member already has a shift scheduled for this time period');
      }

      const shift = new StaffShift({
        ...shiftData,
        createdBy,
        lastUpdatedBy: createdBy
      });

      await shift.save();

      // Send notification to staff
      await this.notificationService.sendNotification({
        recipientId: shiftData.staffId,
        type: 'SHIFT_ASSIGNED',
        title: 'New Shift Assigned',
        message: `You have been assigned a ${shiftData.shiftType} shift on ${new Date(shiftData.shiftDate).toDateString()}`,
        data: {
          shiftId: shift._id,
          shiftDate: shiftData.shiftDate,
          shiftType: shiftData.shiftType,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime
        }
      });

      // Log audit trail
      await this.logAuditTrail({
        action: 'CREATE_SHIFT',
        entityType: 'STAFF_SHIFT',
        entityId: shift._id.toString(),
        userId: createdBy,
        details: {
          staffId: shiftData.staffId,
          shiftDate: shiftData.shiftDate,
          shiftType: shiftData.shiftType,
          department: shiftData.department
        },
        riskLevel: 'LOW'
      });

      return await StaffShift.findById(shift._id).populate('staffId', 'name employeeId role department');
    } catch (error) {
      console.error('Error creating shift:', error);
      throw new Error(error.message || 'Failed to create shift');
    }
  }

  async updateShift(shiftId: string, updates: any, updatedBy: string) {
    try {
      const shift = await StaffShift.findById(shiftId);
      if (!shift) {
        throw new Error('Shift not found');
      }

      // Prevent updates to completed shifts
      if (shift.status === 'Completed' && updates.status !== 'Completed') {
        throw new Error('Cannot modify completed shifts');
      }

      const originalStatus = shift.status;
      Object.assign(shift, updates);
      shift.lastUpdatedBy = updatedBy;
      await shift.save();

      // Send notification if status changed
      if (originalStatus !== shift.status) {
        await this.notificationService.sendNotification({
          recipientId: shift.staffId,
          type: 'SHIFT_UPDATED',
          title: 'Shift Status Updated',
          message: `Your shift status has been updated to ${shift.status}`,
          data: {
            shiftId: shift._id,
            oldStatus: originalStatus,
            newStatus: shift.status
          }
        });
      }

      // Log audit trail
      await this.logAuditTrail({
        action: 'UPDATE_SHIFT',
        entityType: 'STAFF_SHIFT',
        entityId: shiftId,
        userId: updatedBy,
        details: {
          originalStatus,
          newStatus: shift.status,
          updates
        },
        riskLevel: 'MEDIUM'
      });

      return await StaffShift.findById(shiftId).populate('staffId', 'name employeeId role department');
    } catch (error) {
      console.error('Error updating shift:', error);
      throw new Error(error.message || 'Failed to update shift');
    }
  }

  async getShifts(queryParams: any) {
    try {
      const {
        page = 1,
        limit = 20,
        staffId,
        department,
        shiftType,
        status,
        dateFrom,
        dateTo,
        sortBy = 'shiftDate',
        sortOrder = 'desc'
      } = queryParams;

      const skip = (page - 1) * limit;
      const query: any = {};

      if (staffId) query.staffId = staffId;
      if (department) query.department = department;
      if (shiftType) query.shiftType = shiftType;
      if (status) query.status = status;

      if (dateFrom || dateTo) {
        query.shiftDate = {};
        if (dateFrom) query.shiftDate.$gte = new Date(dateFrom);
        if (dateTo) query.shiftDate.$lte = new Date(dateTo);
      }

      const sortConfig: any = {};
      sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [shifts, total] = await Promise.all([
        StaffShift.find(query)
          .populate('staffId', 'name employeeId role department')
          .populate('createdBy', 'name')
          .populate('attendance.checkIn.verifiedBy', 'name')
          .populate('attendance.checkOut.verifiedBy', 'name')
          .sort(sortConfig)
          .skip(skip)
          .limit(limit)
          .lean(),
        StaffShift.countDocuments(query)
      ]);

      return {
        shifts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching shifts:', error);
      throw new Error('Failed to fetch shifts');
    }
  }

  async checkInShift(shiftId: string, checkInData: any, userId: string) {
    try {
      const shift = await StaffShift.findById(shiftId);
      if (!shift) {
        throw new Error('Shift not found');
      }

      if (shift.status !== 'Scheduled') {
        throw new Error('Shift is not in scheduled status');
      }

      await shift.checkIn(checkInData, userId);

      // Log audit trail
      await this.logAuditTrail({
        action: 'SHIFT_CHECK_IN',
        entityType: 'STAFF_SHIFT',
        entityId: shiftId,
        userId,
        details: {
          checkInTime: new Date(),
          method: checkInData.method,
          location: checkInData.location
        },
        riskLevel: 'LOW'
      });

      return await StaffShift.findById(shiftId).populate('staffId', 'name employeeId');
    } catch (error) {
      console.error('Error checking in shift:', error);
      throw new Error(error.message || 'Failed to check in');
    }
  }

  async checkOutShift(shiftId: string, checkOutData: any, userId: string) {
    try {
      const shift = await StaffShift.findById(shiftId);
      if (!shift) {
        throw new Error('Shift not found');
      }

      if (shift.status !== 'In Progress') {
        throw new Error('Shift is not in progress');
      }

      await shift.checkOut(checkOutData, userId);

      // Log audit trail
      await this.logAuditTrail({
        action: 'SHIFT_CHECK_OUT',
        entityType: 'STAFF_SHIFT',
        entityId: shiftId,
        userId,
        details: {
          checkOutTime: new Date(),
          method: checkOutData.method,
          totalHours: shift.attendance.totalHours,
          overtimeHours: shift.attendance.overtimeHours
        },
        riskLevel: 'LOW'
      });

      return await StaffShift.findById(shiftId).populate('staffId', 'name employeeId');
    } catch (error) {
      console.error('Error checking out shift:', error);
      throw new Error(error.message || 'Failed to check out');
    }
  }

  private async checkShiftConflict(staffId: string, shiftDate: string, startTime: string, endTime: string) {
    const date = new Date(shiftDate);
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    return await StaffShift.findOne({
      staffId,
      shiftDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Scheduled', 'In Progress'] },
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } }
          ]
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
          ]
        }
      ]
    });
  }

  // ==================== LEAVE MANAGEMENT ====================

  async createLeaveRequest(leaveData: any, createdBy: string) {
    try {
      // Verify staff exists
      const staff = await User.findById(leaveData.staffId);
      if (!staff) {
        throw new Error('Staff member not found');
      }

      // Check for overlapping leave requests
      const overlappingLeave = await LeaveRequest.findOne({
        staffId: leaveData.staffId,
        status: { $in: ['Pending', 'Approved', 'In Progress'] },
        $or: [
          {
            $and: [
              { startDate: { $lte: new Date(leaveData.startDate) } },
              { endDate: { $gt: new Date(leaveData.startDate) } }
            ]
          },
          {
            $and: [
              { startDate: { $lt: new Date(leaveData.endDate) } },
              { endDate: { $gte: new Date(leaveData.endDate) } }
            ]
          }
        ]
      });

      if (overlappingLeave) {
        throw new Error('Staff member already has leave approved for overlapping dates');
      }

      const leaveRequest = new LeaveRequest({
        ...leaveData,
        createdBy,
        lastUpdatedBy: createdBy
      });

      // Set up approval workflow based on leave type and duration
      await this.setupApprovalWorkflow(leaveRequest, staff);

      await leaveRequest.save();

      // Send notifications to approvers
      await this.sendLeaveApprovalNotifications(leaveRequest);

      // Log audit trail
      await this.logAuditTrail({
        action: 'CREATE_LEAVE_REQUEST',
        entityType: 'LEAVE_REQUEST',
        entityId: leaveRequest._id.toString(),
        userId: createdBy,
        details: {
          staffId: leaveData.staffId,
          leaveType: leaveData.leaveType,
          startDate: leaveData.startDate,
          endDate: leaveData.endDate,
          totalDays: leaveRequest.totalDays
        },
        riskLevel: 'MEDIUM'
      });

      return await LeaveRequest.findById(leaveRequest._id)
        .populate('staffId', 'name employeeId role department')
        .populate('approvalWorkflow.approverId', 'name role');
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw new Error(error.message || 'Failed to create leave request');
    }
  }

  private async setupApprovalWorkflow(leaveRequest: any, staff: any) {
    // Basic approval workflow - can be customized based on organization needs
    leaveRequest.approvalWorkflow = [];

    // Immediate supervisor approval (always required)
    leaveRequest.approvalWorkflow.push({
      approverLevel: 'Immediate Supervisor',
      approverId: staff.currentAssignment?.supervisor || null,
      status: 'Pending'
    });

    // Department head approval for longer leaves or specific types
    if (leaveRequest.totalDays > 7 || ['Maternity Leave', 'Paternity Leave', 'Medical Leave'].includes(leaveRequest.leaveType)) {
      // Find department head (this would need to be implemented based on your org structure)
      leaveRequest.approvalWorkflow.push({
        approverLevel: 'Department Head',
        approverId: null, // Would be populated based on department structure
        status: 'Pending'
      });
    }

    // HR Manager approval for extended leaves
    if (leaveRequest.totalDays > 15 || ['Sabbatical', 'Study Leave'].includes(leaveRequest.leaveType)) {
      leaveRequest.approvalWorkflow.push({
        approverLevel: 'HR Manager',
        approverId: null, // Would be populated based on HR structure
        status: 'Pending'
      });
    }
  }

  private async sendLeaveApprovalNotifications(leaveRequest: any) {
    for (const approval of leaveRequest.approvalWorkflow) {
      if (approval.approverId) {
        await this.notificationService.sendNotification({
          recipientId: approval.approverId,
          type: 'LEAVE_APPROVAL_REQUIRED',
          title: 'Leave Approval Required',
          message: `Leave request from ${leaveRequest.staffId.name} requires your approval`,
          data: {
            leaveRequestId: leaveRequest._id,
            staffName: leaveRequest.staffId.name,
            leaveType: leaveRequest.leaveType,
            startDate: leaveRequest.startDate,
            endDate: leaveRequest.endDate,
            totalDays: leaveRequest.totalDays
          }
        });
      }
    }
  }

  // ==================== HELPER METHODS ====================

  private async logAuditTrail(auditData: any) {
    try {
      // Implementation for audit logging
      console.log('Audit Trail:', auditData);
    } catch (error) {
      console.error('Error logging audit trail:', error);
    }
  }
}
