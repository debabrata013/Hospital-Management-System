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

    // If multiple users found (duplicates by contact/email),
    // find the row whose password hash matches the provided password.
    let user = null as any
    for (const candidate of userArray) {
      try {
        if (candidate?.password_hash) {
          const ok = await bcrypt.compare(password, candidate.password_hash)
          if (ok) {
            user = candidate
            break
          }
        }
      } catch {
        // ignore and continue checking next candidate
      }
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Selected user for login after hash match:', { id: user.id, name: user.name, role: user.role });

    // Note: Do not block login based on schedule.
    // Schedule-based access control is enforced at page access time
    // by middleware for nurse routes (e.g., /nurse/*). This keeps
    // authentication independent from schedule availability and avoids
    // 403s during login when a nurse has no assigned shift.

    // Update last login
    const connection2 = await mysql.createConnection(dbConfig)
    await connection2.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    )

    // Extract IP and User-Agent
    const forwardedFor = request.headers.get('x-forwarded-for') || ''
    const ipAddress = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create admin login logs table if not exists and insert record for admin roles
    try {
      await connection2.execute(`
        CREATE TABLE IF NOT EXISTS admin_login_logs (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT NOT NULL,
          user_uid VARCHAR(50) NULL,
          user_name VARCHAR(255) NULL,
          email VARCHAR(255) NULL,
          role VARCHAR(50) NOT NULL,
          ip_address VARCHAR(100) NULL,
          user_agent VARCHAR(512) NULL,
          logged_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_logged_in_at (logged_in_at),
          INDEX idx_user_id (user_id),
          INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `)

      // Only track admins and super-admins
      if (String(user.role).toLowerCase() === 'admin' || String(user.role).toLowerCase() === 'super-admin') {
        await connection2.execute(
          `INSERT INTO admin_login_logs 
            (user_id, user_uid, user_name, email, role, ip_address, user_agent) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            user.user_id || null,
            user.name || null,
            user.email || null,
            user.role,
            String(ipAddress).slice(0, 100),
            String(userAgent).slice(0, 512)
          ]
        )
      }
    } catch (logErr) {
      console.error('Failed to record admin login log:', logErr)
      // Do not fail login if logging fails
    }
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
