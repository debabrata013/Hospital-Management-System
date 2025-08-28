import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No authentication token provided'
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (tokenError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid or expired token'
        },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found'
        },
        { status: 401 }
      );
    }

    // Check if user is still active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Account is deactivated'
        },
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        specialization: user.specialization,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        permissions: user.permissions,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
