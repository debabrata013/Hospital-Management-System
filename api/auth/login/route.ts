import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false)
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = validation.data;

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+passwordHash');
    
    if (!user) {
      // Log failed login attempt
      await logFailedLogin(email, 'User not found', request);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      await logFailedLogin(email, 'Account deactivated', request);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Account is deactivated. Please contact administrator.'
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      await logFailedLogin(email, 'Invalid password', request);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Check for account lockout (if implemented)
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      await logFailedLogin(email, 'Account locked', request);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Account is temporarily locked. Please try again later.'
        },
        { status: 423 }
      );
    }

    // Generate JWT token
    const tokenExpiry = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: tokenExpiry }
    );

    // Update user login info
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      loginCount: (user.loginCount || 0) + 1,
      failedLoginAttempts: 0, // Reset failed attempts
      lockoutUntil: undefined, // Clear any lockout
      'preferences.lastLoginIP': getClientIP(request),
      'preferences.lastLoginDevice': request.headers.get('user-agent') || 'unknown'
    });

    // Log successful login
    await AuditLog.create({
      userId: user._id,
      userRole: user.role,
      userName: user.name,
      action: `User logged in: ${user.email}`,
      actionType: 'LOGIN',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: getClientIP(request),
      deviceInfo: {
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      riskLevel: 'LOW'
    });

    // Prepare user data for response
    const userData = {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      specialization: user.specialization,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLogin: new Date(),
      permissions: user.permissions,
      preferences: user.preferences
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token: token // Include token in response for client-side storage if needed
    });

    // Set HTTP-only cookie
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
      path: '/'
    });

    // Set user session cookie for client-side access
    response.cookies.set('user-session', JSON.stringify({
      id: user._id,
      name: user.name,
      role: user.role,
      department: user.department
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    // Log system error
    try {
      await AuditLog.create({
        userId: null,
        userRole: 'unknown',
        userName: 'System Error',
        action: `Login system error for email: ${body?.email || 'unknown'}`,
        actionType: 'LOGIN_ERROR',
        resourceType: 'System',
        ipAddress: getClientIP(request),
        deviceInfo: {
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        riskLevel: 'HIGH',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'ERROR'
        }
      });
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

async function logFailedLogin(email: string, reason: string, request: NextRequest): Promise<void> {
  try {
    await AuditLog.create({
      userId: null,
      userRole: 'unknown',
      userName: 'Failed Login Attempt',
      action: `Failed login attempt for email: ${email} - Reason: ${reason}`,
      actionType: 'LOGIN_FAILED',
      resourceType: 'User',
      ipAddress: getClientIP(request),
      deviceInfo: {
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      riskLevel: 'MEDIUM'
    });

    // Increment failed login attempts for the user (if exists)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: any = { failedLoginAttempts: failedAttempts };

      // Lock account after 5 failed attempts
      if (failedAttempts >= 5) {
        updateData.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await User.findByIdAndUpdate(user._id, updateData);
    }
  } catch (error) {
    console.error('Failed to log failed login attempt:', error);
  }
}
