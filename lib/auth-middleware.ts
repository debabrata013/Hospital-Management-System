import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import models from '../models';

// Interface for authenticated user
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  employeeId?: string; // For staff users
}

// Authentication result interface
export interface AuthResult {
  user: AuthenticatedUser;
}

// Get client IP address from request
export function getClientIP(request: NextRequest): string {
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
  return request.ip || '127.0.0.1';
}

// Extract JWT token from request
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }
  return null;
}

// Main authentication function
export async function authenticateUser(request: NextRequest): Promise<AuthResult | NextResponse> {
  try {
    const { User } = models;

    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Authentication token required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    // Note: lockUntil and lastLogin fields don't exist in current database schema
    // Remove these checks until database is updated

    const authenticatedUser: AuthenticatedUser = {
      id: user.id.toString(),
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      role: user.role,
      employeeId: user.employeeId,
    };

    return { user: authenticatedUser };
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: 'Authentication token expired' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// Role-based authentication middleware
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<AuthResult | NextResponse> => {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) {
      return auth;
    }
    if (!allowedRoles.includes(auth.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    return auth;
  };
}

// Permission-based authentication middleware (placeholder - requires permission model)
export function requirePermission(module: string, action: string) {
  return async (request: NextRequest): Promise<AuthResult | NextResponse> => {
    const auth = await authenticateUser(request);
    if (auth instanceof NextResponse) {
      return auth;
    }
    if (auth.user.role === 'super-admin') {
      return auth;
    }
    // Placeholder: Implement actual permission check against a permissions model
    console.warn(`Permission check for ${action} on ${module} is a placeholder.`);
    return auth;
  };
}

// Doctor-specific authentication
export async function authenticateDoctor(request: NextRequest): Promise<AuthResult | NextResponse> {
  const auth = await authenticateUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }
  if (auth.user.role !== 'doctor') {
    return NextResponse.json({ error: 'Doctor access required' }, { status: 403 });
  }
  return auth;
}

// Staff authentication
export async function authenticateStaff(request: NextRequest): Promise<AuthResult | NextResponse> {
  const allowedRoles = ['doctor', 'staff', 'admin', 'super-admin'];
  const auth = await authenticateUser(request);
  if (auth instanceof NextResponse) {
    return auth;
  }
  if (!allowedRoles.includes(auth.user.role)) {
    return NextResponse.json({ error: 'Staff access required' }, { status: 403 });
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
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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
    return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
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
    const { AuditLog } = models;
    await AuditLog.create({
      userId,
      action,
      resource,
      details: details || {},
      ipAddress: ipAddress || 'unknown',
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
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
        return auth;
      }

      return await handler(request, auth);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

// Old implementation - to be replaced
export function old_withAuth(
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
        return auth;
      }
      return await handler(request, auth);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const ipRequests = requests.get(ip) || [];
    const recentRequests = ipRequests.filter((time) => time > windowStart);
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    return true;
  };
}

