import { NextRequest, NextResponse } from 'next/server'
import connectToMongoose from '@/lib/mongoose'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    await connectToMongoose()

    const body = await request.json()
    const { name, email, password, phone, role, department, address } = body

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, phone, role' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate phone number
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['patient', 'doctor', 'staff', 'receptionist']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: patient, doctor, staff, receptionist' },
        { status: 400 }
      )
    }

    // Import User model dynamically
    const mongoose = require('mongoose')
    const User = mongoose.models.User || require('@/models/User.js')

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { contactNumber: phone.replace(/\s/g, '') }
      ]
    })

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      } else {
        return NextResponse.json(
          { error: 'User with this phone number already exists' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      contactNumber: phone.replace(/\s/g, ''),
      isActive: role === 'patient' ? true : false, // Patients are auto-approved, staff needs approval
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add role-specific fields
    if (['doctor', 'staff', 'receptionist'].includes(role)) {
      if (department) {
        userData.department = department.trim()
      }
    }

    if (address) {
      userData.address = {
        street: address.trim(),
        city: '',
        state: '',
        pincode: ''
      }
    }

    // Create user
    const newUser = await User.create(userData)

    // Log registration in audit log
    try {
      const AuditLog = mongoose.models.AuditLog || require('@/models/AuditLog.js')
      await AuditLog.create({
        userId: newUser._id,
        userRole: role,
        userName: name,
        action: `User registered: ${email} (${role})`,
        actionType: 'CREATE',
        resourceType: 'User',
        resourceId: newUser._id.toString(),
        ipAddress: request.ip || 'unknown',
        deviceInfo: {
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        riskLevel: 'LOW'
      })
    } catch (auditError) {
      console.error('Audit logging failed:', auditError)
    }

    // Return success response (don't include sensitive data)
    return NextResponse.json({
      success: true,
      message: role === 'patient' 
        ? 'Registration successful! You can now login.' 
        : 'Registration successful! Your account is pending approval from the administrator.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        needsApproval: !newUser.isActive
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)

    // Log failed registration attempt
    try {
      const mongoose = require('mongoose')
      const AuditLog = mongoose.models.AuditLog || require('@/models/AuditLog.js')
      await AuditLog.create({
        userId: null,
        userRole: 'unknown',
        userName: 'Failed Registration Attempt',
        action: `Failed registration attempt for email: ${body?.email || 'unknown'}`,
        actionType: 'CREATE',
        resourceType: 'User',
        ipAddress: request.ip || 'unknown',
        deviceInfo: {
          userAgent: request.headers.get('user-agent') || 'unknown'
        },
        riskLevel: 'MEDIUM',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'ERROR'
        }
      })
    } catch (auditError) {
      console.error('Audit logging failed:', auditError)
    }

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        { error: `User with this ${field} already exists` },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    )
  }
}
