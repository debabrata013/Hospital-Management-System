import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logAuditAction } from '@/lib/auth-middleware'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/models'
import bcrypt from 'bcryptjs'

// GET - List users with pagination and search
export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (auth instanceof NextResponse) return auth

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    // Build search query
    const query: any = {}
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ]
    }

    if (role) {
      query.role = role
    }

    // Get total count for pagination
    const total = await User.countDocuments(query)

    // Get users with pagination
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Get role statistics
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ])

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        roleStats: roleStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count
          return acc
        }, {})
      }
    })

  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (auth instanceof NextResponse) return auth

    await connectToDatabase()

    const body = await request.json()
    const {
      name,
      email,
      password,
      role,
      contactNumber,
      department,
      specialization,
      qualification,
      experience,
      licenseNumber,
      salary,
      address,
      emergencyContact
    } = body

    // Validate required fields
    if (!name || !email || !password || !role || !contactNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user object
    const userData: any = {
      name,
      email,
      passwordHash,
      role,
      contactNumber,
      isActive: true
    }

    // Add role-specific fields
    if (['doctor', 'staff', 'admin'].includes(role)) {
      userData.department = department
    }

    if (role === 'doctor') {
      userData.specialization = specialization
      userData.qualification = qualification || []
      userData.experience = experience
      userData.licenseNumber = licenseNumber
    }

    if (['doctor', 'staff', 'admin', 'receptionist'].includes(role)) {
      userData.salary = salary
    }

    if (address) {
      userData.address = address
    }

    if (emergencyContact) {
      userData.emergencyContact = emergencyContact
    }

    // Create user
    const user = await User.create(userData)

    // Log audit action
    await logAuditAction(
      auth.user.id,
      `Created user: ${name} (${role})`,
      'CREATE',
      'User',
      user._id.toString(),
      request.ip,
      request.headers.get('user-agent')
    )

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
