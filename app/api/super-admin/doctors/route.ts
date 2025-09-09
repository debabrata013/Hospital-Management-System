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

// GET - Fetch all doctors
export async function GET(request: NextRequest) {
  try {
    const database = loadUserDatabase()
    
    // Filter only doctor role users
    const doctors = database.users.filter(user => user.role === 'doctor')
    
    return NextResponse.json({
      success: true,
      doctors: doctors.map(doctor => ({
        id: doctor.id,
        user_id: doctor.user_id,
        name: doctor.name,
        email: doctor.email,
        mobile: doctor.mobile,
        department: doctor.department,
        isActive: doctor.isActive,
        createdAt: doctor.createdAt,
        lastLogin: doctor.lastLogin
      }))
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}

// POST - Create new doctor
export async function POST(request: NextRequest) {
  try {
    const { name, mobile, password, department } = await request.json()
    
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
    
    // Generate new doctor ID
    const doctorUsers = database.users.filter(user => user.role === 'doctor')
    const nextId = Math.max(...database.users.map(u => u.id), 0) + 1
    const nextDoctorNumber = doctorUsers.length + 1
    const userId = `DR${nextDoctorNumber.toString().padStart(3, '0')}`
    
    // Create new doctor
    const newDoctor: User = {
      id: nextId,
      user_id: userId,
      username: `doctor${nextDoctorNumber}`,
      name: name,
      email: `${userId.toLowerCase()}@hospital.com`,
      mobile: mobile,
      password: password,
      password_hash: "",
      role: "doctor",
      department: department || "General Medicine",
      isActive: true,
      permissions: ["view_patients", "manage_prescriptions", "view_appointments", "update_medical_records"],
      dashboards: ["doctor"],
      createdAt: new Date().toISOString(),
      lastLogin: null
    }
    
    database.users.push(newDoctor)
    saveUserDatabase(database)
    
    return NextResponse.json({
      success: true,
      message: 'Doctor created successfully',
      doctor: {
        id: newDoctor.id,
        user_id: newDoctor.user_id,
        name: newDoctor.name,
        email: newDoctor.email,
        mobile: newDoctor.mobile,
        department: newDoctor.department
      }
    })
  } catch (error) {
    console.error('Error creating doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create doctor' },
      { status: 500 }
    )
  }
}

// PUT - Update doctor
export async function PUT(request: NextRequest) {
  try {
    const { id, name, mobile, password, department } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Doctor ID is required' },
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
    
    // Find doctor to update
    const doctorIndex = database.users.findIndex(user => user.id === id && user.role === 'doctor')
    if (doctorIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
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
    
    // Update doctor
    if (name) database.users[doctorIndex].name = name
    if (mobile) database.users[doctorIndex].mobile = mobile
    if (password) database.users[doctorIndex].password = password
    if (department) database.users[doctorIndex].department = department
    
    saveUserDatabase(database)
    
    return NextResponse.json({
      success: true,
      message: 'Doctor updated successfully',
      doctor: {
        id: database.users[doctorIndex].id,
        user_id: database.users[doctorIndex].user_id,
        name: database.users[doctorIndex].name,
        email: database.users[doctorIndex].email,
        mobile: database.users[doctorIndex].mobile,
        department: database.users[doctorIndex].department
      }
    })
  } catch (error) {
    console.error('Error updating doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update doctor' },
      { status: 500 }
    )
  }
}

// DELETE - Delete doctor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Doctor ID is required' },
        { status: 400 }
      )
    }
    
    const database = loadUserDatabase()
    
    // Find doctor to delete
    const doctorIndex = database.users.findIndex(user => user.id === id && user.role === 'doctor')
    if (doctorIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      )
    }
    
    // Remove doctor from database
    database.users.splice(doctorIndex, 1)
    saveUserDatabase(database)
    
    return NextResponse.json({
      success: true,
      message: 'Doctor deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete doctor' },
      { status: 500 }
    )
  }
}
