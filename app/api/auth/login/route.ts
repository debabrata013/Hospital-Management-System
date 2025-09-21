import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json()

    // Check if login is mobile number or email
    const isMobileLogin = /^[6-9]\d{9}$/.test(login)
    const isEmailLogin = /\S+@\S+\.\S+/.test(login)

    if (!login || (!isMobileLogin && !isEmailLogin)) {
      return NextResponse.json(
        { message: 'Please enter a valid mobile number or email' },
        { status: 400 }
      )
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { message: 'Password must be at least 4 characters long' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    // Find user by mobile number or email
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE (contact_number = ? OR email = ?) AND is_active = 1 ORDER BY id ASC',
      [login, login]
    )
    
    console.log('Login query found users:', users);

    await connection.end()

    const userArray = users as any[]
    if (userArray.length === 0) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // If multiple users found, prefer the one with the lowest ID (original entry)
    // This ensures we use the correct Dr. Rajesh Kumar (ID 3) instead of duplicate (ID 22)
    const user = userArray[0];
    console.log('Selected user for login:', { id: user.id, name: user.name, role: user.role });

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Validate schedule for nurses before allowing login
    if (user.role === 'nurse') {
      console.log('[LOGIN] Validating nurse schedule for user:', user.id)
      
      try {
        const scheduleValidation = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/validate-schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, role: user.role })
        })
        
        const scheduleResult = await scheduleValidation.json()
        console.log('[LOGIN] Schedule validation result:', scheduleResult)
        
        if (!scheduleResult.canLogin) {
          return NextResponse.json(
            { 
              message: scheduleResult.message,
              errorType: scheduleResult.errorType,
              schedule: scheduleResult.schedule
            },
            { status: 403 }
          )
        }
      } catch (scheduleError) {
        console.error('[LOGIN] Schedule validation error:', scheduleError)
        return NextResponse.json(
          { message: 'Unable to validate your schedule. Please contact IT support.' },
          { status: 500 }
        )
      }
    }

    // Update last login
    const connection2 = await mysql.createConnection(dbConfig)
    await connection2.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    )
    await connection2.end()

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      userIdString: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department || user.specialization,
      permissions: []
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    const userData = {
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      mobile: user.contact_number,
      role: user.role,
      department: user.department || user.specialization,
      permissions: []
    }

    const response = NextResponse.json({
      message: 'Login successful',
      user: userData
    })

    // Set cookie with explicit options for better compatibility
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })
    
    console.log('[LOGIN] Cookie set for user:', userData.email)

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
