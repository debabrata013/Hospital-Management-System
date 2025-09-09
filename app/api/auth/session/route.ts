import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'No session found' },
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
      permissions: payload.permissions
    }

    return NextResponse.json({
      message: 'Session valid',
      user: userData
    })

  } catch (error) {
    console.error('Session verification error:', error)
    
    // Clear invalid token
    const response = NextResponse.json(
      { message: 'Invalid session' },
      { status: 401 }
    )
    response.cookies.delete('auth-token')
    
    return response
  }
}
