import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface User {
  id: number
  user_id: string
  username: string
  name: string
  email: string
  mobile: string
  password: string
  password_hash: string
  role: string
  department: string
  isActive: boolean
  permissions: string[]
  dashboards: string[]
  createdAt: string
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

function saveUserDatabase(database: UserDatabase): void {
  try {
    const dbPath = path.join(process.cwd(), 'database', 'users-auth-data.json')
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))
  } catch (error) {
    console.error('Failed to save user database:', error)
    throw new Error('Database save failed')
  }
}

// GET - Fetch all admins
export async function GET(request: NextRequest) {
  try {
    const database = loadUserDatabase()
    
    // Filter only admin role users
    const admins = database.users.filter(user => user.role === 'admin')
    
    return NextResponse.json({
      success: true,
      admins: admins.map(admin => ({
        id: admin.id,
        user_id: admin.user_id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        department: admin.department,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin
      }))
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admins' },
      { status: 500 }
    )
  }
}

// POST - Create new admin
export async function POST(request: NextRequest) {
  try {
    const { name, mobile, password } = await request.json()
    
    // Validate input
    if (!name || !mobile || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, mobile, and password are required' },
        { status: 400 }
      )
    }
    
    // Validate mobile number (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      )
    }
    
    // Validate password (6 digits)
    if (!/^\d{6}$/.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must be exactly 6 digits' },
        { status: 400 }
      )
    }
    
    const database = loadUserDatabase()
    
    // Check if mobile already exists
    const existingUser = database.users.find(user => user.mobile === mobile)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Mobile number already exists' },
        { status: 400 }
      )
    }
    
    // Generate new admin ID
    const adminUsers = database.users.filter(user => user.role === 'admin')
    const nextId = Math.max(...database.users.map(u => u.id), 0) + 1
    const nextAdminNumber = adminUsers.length + 1
    const userId = `AD${nextAdminNumber.toString().padStart(3, '0')}`
    
    // Create new admin
    const newAdmin: User = {
      id: nextId,
      user_id: userId,
      username: `admin${nextAdminNumber}`,
      name: name,
      email: `${userId.toLowerCase()}@hospital.com`,
      mobile: mobile,
      password: password,
      password_hash: "",
      role: "admin",
      department: "Administration",
      isActive: true,
      permissions: ["manage_users", "view_reports", "manage_appointments", "manage_rooms", "manage_billing"],
      dashboards: ["admin"],
      createdAt: new Date().toISOString(),
      lastLogin: null
    }
    
    database.users.push(newAdmin)
    saveUserDatabase(database)
    
    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: newAdmin.id,
        user_id: newAdmin.user_id,
        name: newAdmin.name,
        email: newAdmin.email,
        mobile: newAdmin.mobile,
        department: newAdmin.department
      }
    })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create admin' },
      { status: 500 }
    )
  }
}

// PUT - Update admin
export async function PUT(request: NextRequest) {
  try {
    const { id, name, mobile, password } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID is required' },
        { status: 400 }
      )
    }
    
    // Validate mobile number if provided
    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      )
    }
    
    // Validate password if provided
    if (password && !/^\d{6}$/.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must be exactly 6 digits' },
        { status: 400 }
      )
    }
    
    const database = loadUserDatabase()
    
    // Find admin to update
    const adminIndex = database.users.findIndex(user => user.id === id && user.role === 'admin')
    if (adminIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }
    
    // Check if mobile already exists for other users
    if (mobile) {
      const existingUser = database.users.find(user => user.mobile === mobile && user.id !== id)
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Mobile number already exists' },
          { status: 400 }
        )
      }
    }
    
    // Update admin
    if (name) database.users[adminIndex].name = name
    if (mobile) database.users[adminIndex].mobile = mobile
    if (password) database.users[adminIndex].password = password
    
    saveUserDatabase(database)
    
    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        id: database.users[adminIndex].id,
        user_id: database.users[adminIndex].user_id,
        name: database.users[adminIndex].name,
        email: database.users[adminIndex].email,
        mobile: database.users[adminIndex].mobile,
        department: database.users[adminIndex].department
      }
    })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update admin' },
      { status: 500 }
    )
  }
}

// DELETE - Delete admin
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Admin ID is required' },
        { status: 400 }
      )
    }
    
    const database = loadUserDatabase()
    
    // Find admin to delete
    const adminIndex = database.users.findIndex(user => user.id === id && user.role === 'admin')
    if (adminIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }
    
    // Remove admin from database
    database.users.splice(adminIndex, 1)
    saveUserDatabase(database)
    
    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin' },
      { status: 500 }
    )
  }
}
