import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/models';

// Interface for authenticated user
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  patientId?: string; // For patient users
  employeeId?: string; // For staff users
}

// Authentication result interface
export interface AuthResult {
  user: AuthenticatedUser;
}

// Get client IP address from request
export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to connection remote address
  return request.ip || '127.0.0.1';
}

// Extract JWT token from request
function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  
  // Check patient-specific token
  const patientTokenCookie = request.cookies.get('patient-auth-token');
  if (patientTokenCookie) {
    return patientTokenCookie.value;
  }
  
  return null;
}

// Main authentication function
export async function authenticateUser(request: NextRequest): Promise<AuthResult | NextResponse> {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    // Fetch user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }
    
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }
    
    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return NextResponse.json(
        { error: 'Account is temporarily locked' },
        { status: 401 }
      );
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Prepare authenticated user object
    const authenticatedUser: AuthenticatedUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employeeId
    };
    
    // Add patient ID for patient users
    if (user.role === 'patient') {
      // For patient users, we need to find their patient record
      const { Patient } = await import('@/models');
      const patient = await Patient.findOne({ 'portalAccess.userId': user._id });
      if (patient) {
        authenticatedUser.patientId = patient._id.toString();
      }
    }
    
    return { user: authenticatedUser };
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Authentication token expired' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Role-based authentication middleware
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<AuthResult | NextResponse> => {
    const auth = await authenticateUser(request);
    
    if (auth instanceof NextResponse) {
      return auth; // Return error response
    }
    
    if (!allowedRoles.includes(auth.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    return auth;
  };
}

// Permission-based authentication middleware
export function requirePermission(module: string, action: string) {
  return async (request: NextRequest): Promise<AuthResult | NextResponse> => {
    const auth = await authenticateUser(request);
    
    if (auth instanceof NextResponse) {
      return auth; // Return error response
    }
    
    // Super admin has all permissions
    if (auth.user.role === 'super-admin') {
      return auth;
    }
    
    // Check user permissions
    const user = await User.findById(auth.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }
    
    const hasPermission = user.permissions.some(
      (perm: any) => perm.module === module && perm.actions.includes(action)
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: `Permission denied: ${action} on ${module}` },
        { status: 403 }
      );
    }
    
    return auth;
  };
}

// Patient-specific authentication
export async function authenticatePatient(request: NextRequest): Promise<AuthResult | NextResponse> {
  const auth = await authenticateUser(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  if (auth.user.role !== 'patient') {
    return NextResponse.json(
      { error: 'Patient access required' },
      { status: 403 }
    );
  }
  
  if (!auth.user.patientId) {
    return NextResponse.json(
      { error: 'Patient record not found' },
      { status: 404 }
    );
  }
  
  return auth;
}

// Doctor-specific authentication
export async function authenticateDoctor(request: NextRequest): Promise<AuthResult | NextResponse> {
  const auth = await authenticateUser(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  if (auth.user.role !== 'doctor') {
    return NextResponse.json(
      { error: 'Doctor access required' },
      { status: 403 }
    );
  }
  
  return auth;
}

// Staff authentication (doctors, nurses, admin)
export async function authenticateStaff(request: NextRequest): Promise<AuthResult | NextResponse> {
  const allowedRoles = ['doctor', 'staff', 'admin', 'super-admin'];
  
  const auth = await authenticateUser(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  if (!allowedRoles.includes(auth.user.role)) {
    return NextResponse.json(
      { error: 'Staff access required' },
      { status: 403 }
    );
  }
  
  return auth;
}

// Admin authentication
export async function authenticateAdmin(request: NextRequest): Promise<AuthResult | NextResponse> {
  const allowedRoles = ['admin', 'super-admin'];
  
  const auth = await authenticateUser(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  if (!allowedRoles.includes(auth.user.role)) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }
  
  return auth;
}

// Super Admin authentication
export async function requireSuperAdmin(request: NextRequest): Promise<AuthResult | NextResponse> {
  const auth = await authenticateUser(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  if (auth.user.role !== 'super-admin') {
    return NextResponse.json(
      { error: 'Super admin access required' },
      { status: 403 }
    );
  }
  
  return auth;
}

// Audit logging function
export async function logAuditAction(
  userId: string,
  action: string,
  resource: string,
  details?: any,
  ipAddress?: string
): Promise<void> {
  try {
    const { AuditLog } = await import('@/models');
    
    await AuditLog.create({
      userId,
      action,
      resource,
      details: details || {},
      ipAddress: ipAddress || 'unknown',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

// Middleware wrapper for API routes
export function withAuth(
  handler: (request: NextRequest, auth: AuthResult) => Promise<NextResponse>,
  options: {
    roles?: string[];
    permissions?: { module: string; action: string };
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let auth: AuthResult | NextResponse;
      
      if (options.roles) {
        auth = await requireRole(options.roles)(request);
      } else if (options.permissions) {
        auth = await requirePermission(options.permissions.module, options.permissions.action)(request);
      } else {
        auth = await authenticateUser(request);
      }
      
      if (auth instanceof NextResponse) {
        return auth; // Return error response
      }
      
      return await handler(request, auth);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Rate limiting helper
export function rateLimit(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>();
  
  return (request: NextRequest): boolean => {
    const ip = getClientIP(request);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this IP
    const ipRequests = requests.get(ip) || [];
    
    // Filter out old requests
    const recentRequests = ipRequests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    
    return true; // Request allowed
  };
}

export default {
  authenticateUser,
  authenticatePatient,
  authenticateDoctor,
  authenticateStaff,
  authenticateAdmin,
  requireSuperAdmin,
  requireRole,
  requirePermission,
  withAuth,
  getClientIP,
  rateLimit,
  logAuditAction
};
