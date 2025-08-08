import { NextRequest, NextResponse } from 'next/server'
import connectToMongoose from '@/lib/mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  let body: any = {}
  
  try {
    await connectToMongoose()

    body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Import User model directly
    const User = (await import('@/models/User.js')).default

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact administrator.' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      updatedAt: new Date()
    })

    // Log successful login
    try {
      const AuditLog = (await import('@/models/AuditLog.js')).default
      await AuditLog.create({
        userId: user._id,
        userRole: user.role,
        userName: user.name,
        action: `User logged in: ${user.email}`,
        actionType: 'LOGIN',
        resourceType: 'User',
        resourceId: user._id.toString(),
        ipAddress: request.ip || 'unknown',
        deviceInfo: {
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        riskLevel: 'LOW'
      })
    } catch (auditError) {
      console.error('Audit logging failed:', auditError)
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        lastLogin: new Date()
      }
    })

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    // Log failed login attempt
    try {
      const AuditLog = (await import('@/models/AuditLog.js')).default
      await AuditLog.create({
        userId: null,
        userRole: 'unknown',
        userName: 'Failed Login Attempt',
        action: `Failed login attempt for email: ${body?.email || 'unknown'}`,
        actionType: 'LOGIN_FAILED',
        resourceType: 'User',
        ipAddress: request.ip || 'unknown',
        deviceInfo: {
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        riskLevel: 'MEDIUM',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'ERROR'
        }
      })
    } catch (auditError) {
      console.error('Audit logging failed:', auditError)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
