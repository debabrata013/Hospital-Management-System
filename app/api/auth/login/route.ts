import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import fs from 'fs'
import path from 'path'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

interface User {
  id: number
  user_id: string
  username: string
  name: string
  email: string
  mobile: string
  password: string
  role: string
  department: string
  isActive: boolean
  permissions: string[]
  dashboards: string[]
  lastLogin: string | null
}

interface UserDatabase {
  users: User[]
  roles: Record<string, any>
  security_settings: any
}

function loadUserDatabase(): UserDatabase {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'users-auth-data.json')
    const data = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load user database:', error)
    throw new Error('Database connection failed')
  }
}

function updateLastLogin(userId: number): void {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'users-auth-data.json')
    const database = loadUserDatabase()
    
    const userIndex = database.users.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      database.users[userIndex].lastLogin = new Date().toISOString()
      fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))
    }
  } catch (error) {
    console.error('Failed to update last login:', error)
  }
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

    const database = loadUserDatabase()

    // Find user by mobile number or email
    const user = database.users.find(u => 
      isMobileLogin ? u.mobile === login : u.email === login
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Account is deactivated. Please contact administrator.' },
        { status: 401 }
      )
    }

    // Verify password (plain text comparison)
    if (password !== user.password) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    updateLastLogin(user.id)

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      userIdString: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      permissions: user.permissions
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
      mobile: user.mobile,
      role: user.role,
      department: user.department,
      permissions: user.permissions,
      dashboards: user.dashboards
    }

    const response = NextResponse.json({
      message: 'Login successful',
      user: userData
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
