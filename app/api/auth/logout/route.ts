import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, logAuditAction, getClientIP } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    // Get current user for audit logging
    const auth = await authenticateUser(request)
    
    if (auth.user) {
      // Log logout action
      await logAuditAction(
        auth.user.id,
        `User logged out: ${auth.user.email}`,
        'LOGOUT',
        'User',
        auth.user.id,
        getClientIP(request),
        request.headers.get('user-agent') || undefined
      )
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    
    // Still clear the cookie even if audit logging fails
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })

    return response
  }
}
