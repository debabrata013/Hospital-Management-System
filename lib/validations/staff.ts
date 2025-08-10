import { z } from 'zod';

// Staff Profile Schemas
export const createStaffProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  personalInfo: z.object({
    dateOfBirth: z.string().datetime('Invalid date of birth'),
    gender: z.enum(['Male', 'Female', 'Other']),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).default('Single'),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    nationality: z.string().default('Indian'),
    religion: z.string().optional(),
    languages: z.array(z.object({
      language: z.string(),
      proficiency: z.enum(['Basic', 'Intermediate', 'Advanced', 'Native'])
    })).optional()
  }),
  identification: z.object({
    aadharNumber: z.string().regex(/^[0-9]{12}$/, 'Invalid Aadhar number').optional(),
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number').optional(),
    passportNumber: z.string().optional(),
    drivingLicense: z.object({
      number: z.string().optional(),
      expiryDate: z.string().datetime().optional(),
      category: z.array(z.string()).optional()
    }).optional(),
    voterIdNumber: z.string().optional()
  }).optional(),
  qualifications: z.array(z.object({
    degree: z.string().min(1, 'Degree is required'),
    specialization: z.string().optional(),
    institution: z.string().min(1, 'Institution is required'),
    university: z.string().optional(),
    yearOfPassing: z.number().min(1950).max(new Date().getFullYear()),
    grade: z.string().optional(),
    percentage: z.number().min(0).max(100).optional(),
    certificatePath: z.string().optional()
  })).optional(),
  experience: z.array(z.object({
    organization: z.string().min(1, 'Organization is required'),
    position: z.string().min(1, 'Position is required'),
    department: z.string().optional(),
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date').optional(),
    isCurrent: z.boolean().default(false),
    responsibilities: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
    reasonForLeaving: z.string().optional(),
    salary: z.object({
      amount: z.number().min(0).optional(),
      currency: z.string().default('INR')
    }).optional(),
    contactPerson: z.object({
      name: z.string().optional(),
      designation: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional()
    }).optional()
  })).optional(),
  currentAssignment: z.object({
    department: z.string().optional(),
    ward: z.string().optional(),
    shift: z.enum(['Morning', 'Evening', 'Night', 'Rotating', 'Fixed']).optional(),
    supervisor: z.string().optional(),
    workLocation: z.string().optional(),
    specialAssignments: z.array(z.string()).optional(),
    assignmentDate: z.string().datetime().optional()
  }).optional()
});

export const updateStaffProfileSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  updates: createStaffProfileSchema.partial()
});

// Staff Shift Schemas
export const createShiftSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  shiftDate: z.string().datetime('Invalid shift date'),
  shiftType: z.enum(['Morning', 'Evening', 'Night', 'Full Day', 'Emergency', 'On-Call']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  breakTime: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
    duration: z.number().min(0).max(120).default(30)
  }).optional(),
  department: z.string().min(1, 'Department is required'),
  ward: z.string().optional(),
  room: z.string().optional(),
  floor: z.string().optional(),
  responsibilities: z.array(z.object({
    task: z.string().min(1, 'Task is required'),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    notes: z.string().optional()
  })).optional(),
  doctorSchedule: z.object({
    maxPatients: z.number().min(1).max(50).default(20),
    consultationFee: z.number().min(0).optional(),
    emergencyAvailable: z.boolean().default(false)
  }).optional(),
  notes: z.string().optional()
});

export const updateShiftSchema = z.object({
  shiftId: z.string().min(1, 'Shift ID is required'),
  updates: z.object({
    status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Emergency']).optional(),
    notes: z.string().optional(),
    supervisorNotes: z.string().optional()
  })
});

export const checkInSchema = z.object({
  shiftId: z.string().min(1, 'Shift ID is required'),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional(),
  method: z.enum(['Manual', 'Biometric', 'RFID', 'Mobile App', 'QR Code']).default('Manual')
});

export const checkOutSchema = z.object({
  shiftId: z.string().min(1, 'Shift ID is required'),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional()
  }).optional(),
  method: z.enum(['Manual', 'Biometric', 'RFID', 'Mobile App', 'QR Code']).default('Manual')
});

export const addBreakSchema = z.object({
  shiftId: z.string().min(1, 'Shift ID is required'),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  duration: z.number().min(1).max(120),
  reason: z.string().optional()
});

// Leave Request Schemas
export const createLeaveRequestSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  leaveType: z.enum([
    'Annual Leave', 'Sick Leave', 'Maternity Leave', 'Paternity Leave', 
    'Emergency Leave', 'Casual Leave', 'Compensatory Leave', 'Study Leave',
    'Bereavement Leave', 'Medical Leave', 'Unpaid Leave', 'Sabbatical'
  ]),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  totalDays: z.number().min(0.5, 'Minimum 0.5 days required').optional(),
  reason: z.string().min(1, 'Reason is required').max(500),
  description: z.string().max(1000).optional(),
  urgency: z.enum(['Low', 'Medium', 'High', 'Emergency']).default('Medium'),
  documents: z.array(z.object({
    documentType: z.enum(['Medical Certificate', 'Death Certificate', 'Travel Documents', 'Other']),
    documentName: z.string(),
    documentPath: z.string()
  })).optional(),
  coverage: z.object({
    isRequired: z.boolean().default(true),
    handoverNotes: z.string().optional(),
    criticalTasks: z.array(z.string()).optional()
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional()
  }).optional()
});

export const updateLeaveRequestSchema = z.object({
  leaveRequestId: z.string().min(1, 'Leave request ID is required'),
  updates: z.object({
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled', 'In Progress', 'Completed']).optional(),
    hrNotes: z.string().optional(),
    supervisorNotes: z.string().optional(),
    medicalNotes: z.string().optional()
  })
});

export const approveLeaveSchema = z.object({
  leaveRequestId: z.string().min(1, 'Leave request ID is required'),
  approverId: z.string().min(1, 'Approver ID is required'),
  comments: z.string().optional(),
  conditions: z.string().optional()
});

export const rejectLeaveSchema = z.object({
  leaveRequestId: z.string().min(1, 'Leave request ID is required'),
  approverId: z.string().min(1, 'Approver ID is required'),
  comments: z.string().min(1, 'Rejection reason is required')
});

export const extendLeaveSchema = z.object({
  leaveRequestId: z.string().min(1, 'Leave request ID is required'),
  newEndDate: z.string().datetime('Invalid end date'),
  additionalDays: z.number().min(1, 'Additional days must be at least 1'),
  reason: z.string().min(1, 'Extension reason is required')
});

// Query Schemas
export const staffQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(['super-admin', 'admin', 'doctor', 'staff', 'receptionist']).optional(),
  employmentStatus: z.enum(['Active', 'On Leave', 'Suspended', 'Terminated', 'Resigned', 'Retired']).optional(),
  shiftType: z.enum(['Morning', 'Evening', 'Night', 'Rotating', 'Fixed']).optional(),
  sortBy: z.enum(['name', 'employeeId', 'department', 'joiningDate', 'lastLogin']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export const shiftQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  staffId: z.string().optional(),
  department: z.string().optional(),
  shiftType: z.enum(['Morning', 'Evening', 'Night', 'Full Day', 'Emergency', 'On-Call']).optional(),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Emergency']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['shiftDate', 'startTime', 'staffName', 'department']).default('shiftDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const leaveQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  staffId: z.string().optional(),
  leaveType: z.enum([
    'Annual Leave', 'Sick Leave', 'Maternity Leave', 'Paternity Leave', 
    'Emergency Leave', 'Casual Leave', 'Compensatory Leave', 'Study Leave',
    'Bereavement Leave', 'Medical Leave', 'Unpaid Leave', 'Sabbatical'
  ]).optional(),
  status: z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled', 'In Progress', 'Completed']).optional(),
  urgency: z.enum(['Low', 'Medium', 'High', 'Emergency']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  approverId: z.string().optional(),
  sortBy: z.enum(['startDate', 'createdAt', 'staffName', 'leaveType', 'status']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Performance and Training Schemas
export const addPerformanceReviewSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  reviewPeriod: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  }),
  reviewType: z.enum(['Annual', 'Mid-Year', 'Probation', 'Project-based', 'Disciplinary']),
  overallRating: z.number().min(1).max(5),
  competencyRatings: z.array(z.object({
    competency: z.string(),
    rating: z.number().min(1).max(5),
    comments: z.string().optional()
  })).optional(),
  achievements: z.array(z.string()).optional(),
  areasForImprovement: z.array(z.string()).optional(),
  goals: z.array(z.object({
    goal: z.string(),
    targetDate: z.string().datetime().optional()
  })).optional(),
  reviewComments: z.string().optional(),
  actionPlan: z.string().optional(),
  nextReviewDate: z.string().datetime().optional()
});

export const addTrainingSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  trainingName: z.string().min(1, 'Training name is required'),
  trainingType: z.enum(['Orientation', 'Skill Development', 'Safety', 'Compliance', 'Leadership', 'Technical', 'Other']),
  provider: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  duration: z.number().min(1).optional(),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).default('Scheduled')
});

export const addDisciplinaryActionSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  actionType: z.enum(['Verbal Warning', 'Written Warning', 'Suspension', 'Termination', 'Counseling']),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().optional(),
  witnessedBy: z.array(z.string()).optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().datetime().optional()
});

// Reporting Schemas
export const staffReportSchema = z.object({
  reportType: z.enum(['attendance', 'performance', 'leave_summary', 'shift_analysis', 'department_stats']),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  department: z.string().optional(),
  staffId: z.string().optional(),
  includeInactive: z.boolean().default(false),
  groupBy: z.enum(['department', 'role', 'shift', 'month', 'week']).optional()
});

export const attendanceReportSchema = z.object({
  reportType: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  department: z.string().optional(),
  staffIds: z.array(z.string()).optional(),
  includeBreaks: z.boolean().default(true),
  includeOvertime: z.boolean().default(true)
});

// Bulk Operations Schemas
export const bulkShiftCreateSchema = z.object({
  shifts: z.array(createShiftSchema).min(1).max(50),
  validateOnly: z.boolean().default(false)
});

export const bulkLeaveApprovalSchema = z.object({
  leaveRequestIds: z.array(z.string()).min(1).max(20),
  action: z.enum(['approve', 'reject']),
  comments: z.string().optional(),
  approverId: z.string().min(1, 'Approver ID is required')
});

export const bulkStaffUpdateSchema = z.object({
  staffIds: z.array(z.string()).min(1).max(50),
  updates: z.object({
    department: z.string().optional(),
    shift: z.enum(['Morning', 'Evening', 'Night', 'Rotating', 'Fixed']).optional(),
    supervisor: z.string().optional(),
    employmentStatus: z.enum(['Active', 'On Leave', 'Suspended', 'Terminated', 'Resigned', 'Retired']).optional()
  }),
  reason: z.string().optional()
});
