import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    let userId = null;
    let userInfo = null;

    if (token) {
      try {
        // Verify and decode token to get user info for logging
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        userId = decoded.userId;
        
        // Get user info for audit log
        const user = await User.findById(userId).select('name email role');
        if (user) {
          userInfo = {
            name: user.name,
            email: user.email,
            role: user.role
          };
        }
      } catch (tokenError) {
        console.error('Token verification failed during logout:', tokenError);
        // Continue with logout even if token is invalid
      }
    }

    // Log logout attempt
    await AuditLog.create({
      userId: userId,
      userRole: userInfo?.role || 'unknown',
      userName: userInfo?.name || 'Unknown User',
      action: `User logged out: ${userInfo?.email || 'unknown'}`,
      actionType: 'LOGOUT',
      resourceType: 'User',
      resourceId: userId?.toString(),
      ipAddress: getClientIP(request),
      deviceInfo: {
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      riskLevel: 'LOW'
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear auth cookies
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('user-session', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);

    // Still clear cookies even if there's an error
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('user-session', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;
  }
}

// Helper function
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
