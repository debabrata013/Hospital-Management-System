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
    const { mobile, password } = await request.json()

    // Validate mobile number (exactly 10 digits)
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { message: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      )
    }

    // Validate password (exactly 6 digits)
    if (!password || !/^\d{6}$/.test(password)) {
      return NextResponse.json(
        { message: 'Please enter a valid 6-digit password' },
        { status: 400 }
      )
    }

    const database = loadUserDatabase()

    // Find user by mobile number
    const user = database.users.find(u => u.mobile === mobile)

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid mobile number or password' },
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
        { message: 'Invalid mobile number or password' },
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
