// Utility functions for API routes to handle static generation

/**
 * Determines if the current execution is during a static build
 * This helps API routes provide mock data during static builds
 */
export function isStaticBuild() {
  return process.env.NEXT_STATIC_BUILD === 'true' || 
         process.env.STATIC_BUILD === 'true' || 
         process.env.NEXT_PHASE === 'phase-export';
}

/**
 * Provides a safe way to access request parameters during both dynamic
 * requests and static builds
 * @param {Request} request - The request object
 * @param {Object} mockParams - Mock params to use during static build
 * @returns {Object} URL search params
 */
export function getSearchParams(request, mockParams = {}) {
  if (isStaticBuild()) {
    return {
      get: (key) => mockParams[key],
      has: (key) => mockParams.hasOwnProperty(key),
      getAll: (key) => mockParams[key] ? [mockParams[key]] : [],
      toString: () => new URLSearchParams(mockParams).toString()
    };
  }
  
  try {
    return new URL(request.url).searchParams;
  } catch (error) {
    console.error('Error parsing URL in getSearchParams:', error);
    return {
      get: () => null,
      has: () => false,
      getAll: () => [],
      toString: () => ''
    };
  }
}

/**
 * Safely access cookies during both dynamic requests and static builds
 * @param {Request} request - The request object
 * @param {Object} mockCookies - Mock cookies to use during static build
 * @returns {Object} Cookies object
 */
export function getCookies(request, mockCookies = {}) {
  if (isStaticBuild()) {
    return {
      get: (key) => mockCookies[key] ? { value: mockCookies[key] } : undefined,
      getAll: () => Object.entries(mockCookies).map(([name, value]) => ({ name, value }))
    };
  }
  
  try {
    return request.cookies;
  } catch (error) {
    console.error('Error accessing cookies:', error);
    return {
      get: () => undefined,
      getAll: () => []
    };
  }
}

/**
 * Safely access request headers during both dynamic requests and static builds
 * @param {Request} request - The request object
 * @param {Object} mockHeaders - Mock headers to use during static build
 * @returns {Object} Headers object
 */
export function getHeaders(request, mockHeaders = {}) {
  if (isStaticBuild()) {
    return {
      get: (key) => mockHeaders[key.toLowerCase()],
      has: (key) => mockHeaders.hasOwnProperty(key.toLowerCase()),
      entries: () => Object.entries(mockHeaders)
    };
  }
  
  try {
    return request.headers;
  } catch (error) {
    console.error('Error accessing headers:', error);
    return {
      get: () => null,
      has: () => false,
      entries: () => []
    };
  }
}

/**
 * Generate mock data for various API endpoints during static build
 * @param {string} route - The API route path
 * @returns {Object} Mock data for the specified route
 */
export function getMockData(route) {
  const mockData = {
    // Session related mocks
    '/api/auth/session': {
      message: 'Session valid',
      user: {
        id: 1,
        user_id: 'ADMIN-001',
        name: 'Static Build User',
        email: 'admin@example.com',
        role: 'admin',
        department: 'Administration',
        permissions: ['read', 'write', 'admin']
      }
    },
    
    // Admin related mocks
    '/api/admin/inventory/reports': {
      success: true,
      data: {
        summary: {
          total_medicines: 120,
          total_stock: 5280,
          total_value: 158400,
          critical_count: 15,
          expiring_count: 8
        },
        categoryBreakdown: [
          { category: 'Antibiotics', medicine_count: 25, total_stock: 1200, total_value: 42000 },
          { category: 'Painkillers', medicine_count: 18, total_stock: 950, total_value: 28500 },
          { category: 'Vitamins', medicine_count: 22, total_stock: 1100, total_value: 22000 }
        ]
      }
    },
    
    // Staff related mocks
    '/api/staff/attendance': {
      success: true,
      data: {
        attendanceHistory: [
          { id: 1, staff_id: 'STAFF-001', check_in: '2023-09-01T08:00:00Z', check_out: '2023-09-01T16:00:00Z', status: 'present' },
          { id: 2, staff_id: 'STAFF-001', check_in: '2023-09-02T08:15:00Z', check_out: '2023-09-02T16:30:00Z', status: 'present' }
        ],
        stats: {
          present: 22,
          absent: 3,
          late: 5,
          onLeave: 2
        }
      }
    },
    
    // Doctor related mocks
    '/api/doctor/profile': {
      success: true,
      doctor: {
        id: 1,
        doctor_id: 'DOC-001',
        name: 'Dr. Sample Doctor',
        specialization: 'General Medicine',
        qualification: 'MBBS, MD',
        experience: 10,
        contact_number: '9876543210',
        email: 'doctor@example.com'
      }
    },
    
    // Patient related mocks
    '/api/staff/patients': {
      success: true,
      patients: [
        { id: 1, name: 'Patient One', age: 45, gender: 'Male', contact_number: '9876543211' },
        { id: 2, name: 'Patient Two', age: 32, gender: 'Female', contact_number: '9876543212' }
      ]
    },
    
    // AI stats mocks
    '/api/ai/stats': {
      success: true,
      stats: {
        total_requests: 250,
        summaries_generated: 120,
        diet_plans_created: 85,
        approval_rate: 92
      }
    },
    
    // Staff breaks mocks
    '/api/admin/staff/breaks': {
      success: true,
      breaks: [
        { id: 1, staff_id: 'STAFF-001', start_time: '2023-09-01T10:00:00Z', end_time: '2023-09-01T10:15:00Z', duration: 15 },
        { id: 2, staff_id: 'STAFF-001', start_time: '2023-09-01T13:00:00Z', end_time: '2023-09-01T13:30:00Z', duration: 30 }
      ]
    },
    
    // Leave requests mocks
    '/api/admin/staff/leave-requests': {
      success: true,
      leaveRequests: [
        { id: 1, staff_id: 'STAFF-001', from_date: '2023-09-15', to_date: '2023-09-17', reason: 'Personal', status: 'approved' },
        { id: 2, staff_id: 'STAFF-002', from_date: '2023-09-20', to_date: '2023-09-22', reason: 'Medical', status: 'pending' }
      ]
    },
    
    // Billing related mocks
    '/api/receptionist/billing/patients': {
      success: true,
      patients: [
        { id: 1, name: 'Patient One', contact_number: '9876543211' },
        { id: 2, name: 'Patient Two', contact_number: '9876543212' }
      ]
    },
    
    // Patient search mocks
    '/api/receptionist/patients/search': {
      success: true,
      patients: [
        { id: 1, name: 'Patient One', contact_number: '9876543211' },
        { id: 2, name: 'Patient Two', contact_number: '9876543212' }
      ]
    },
    
    // Staff lookup mocks
    '/api/staff/lookup-by-mobile': {
      success: true,
      staff: {
        id: 1,
        staff_id: 'STAFF-001',
        name: 'Staff Member',
        department: 'Nursing',
        contact_number: '9876543210',
        email: 'staff@example.com'
      }
    },
    
    // Billing analytics mocks
    '/api/super-admin/billing-analytics': {
      success: true,
      analytics: {
        total_revenue: 125000,
        monthly_trend: [
          { month: 'Jan', revenue: 12000 },
          { month: 'Feb', revenue: 15000 },
          { month: 'Mar', revenue: 18000 }
        ],
        payment_methods: {
          cash: 65,
          card: 25,
          online: 10
        }
      }
    }
  };

  return mockData[route] || { success: true, message: 'Mock data for static build' };
}