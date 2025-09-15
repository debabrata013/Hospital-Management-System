import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies - try primary first, then backup
    let token = request.cookies.get('auth-token')?.value
    if (!token) {
      token = request.cookies.get('auth-backup')?.value
    }

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Return user data
    const userData = {
      id: payload.userId,
      user_id: payload.userIdString,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      department: payload.department,
      permissions: payload.permissions || []
    }

    return NextResponse.json({
      message: 'User authenticated',
      user: userData
    })

  } catch (error) {
    console.error('Auth verification error:', error)
    
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}
