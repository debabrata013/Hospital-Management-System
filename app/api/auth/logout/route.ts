import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      message: 'Logout successful'
    })

    // Clear both auth cookies
    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge: 0, // Expire immediately
      path: '/'
    }
    
    response.cookies.set('auth-token', '', cookieOptions)
    response.cookies.set('auth-backup', '', {
      ...cookieOptions,
      httpOnly: false
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    )
  }
}
