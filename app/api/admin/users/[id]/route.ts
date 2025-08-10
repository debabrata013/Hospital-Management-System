import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin, logAuditAction, getClientIP } from '@/lib/auth-middleware'
import connectToMongoose from '@/lib/mongoose'
const { User } = require('@/models')
import bcrypt from 'bcryptjs'

// GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireSuperAdmin(request)
    if (auth instanceof NextResponse) return auth

    await connectToMongoose()

    const user = await User.findById(params.id).select('-passwordHash')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireSuperAdmin(request)
    if (auth instanceof NextResponse) return auth

    await connectToMongoose()

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
      emergencyContact,
      isActive
    } = body

    // Find existing user
    const existingUser = await User.findById(params.id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: params.id } })
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: any = {}
    
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (contactNumber) updateData.contactNumber = contactNumber
    if (typeof isActive === 'boolean') updateData.isActive = isActive

    // Hash new password if provided
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12)
    }

    // Role-specific fields
    if (['doctor', 'staff', 'admin'].includes(role || existingUser.role)) {
      if (department) updateData.department = department
    }

    if ((role || existingUser.role) === 'doctor') {
      if (specialization) updateData.specialization = specialization
      if (qualification) updateData.qualification = qualification
      if (experience !== undefined) updateData.experience = experience
      if (licenseNumber) updateData.licenseNumber = licenseNumber
    }

    if (['doctor', 'staff', 'admin', 'receptionist'].includes(role || existingUser.role)) {
      if (salary !== undefined) updateData.salary = salary
    }

    if (address) updateData.address = address
    if (emergencyContact) updateData.emergencyContact = emergencyContact

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash')

    // Log audit action
    await logAuditAction(
      auth.user.id,
      `Updated user: ${updatedUser.name} (${updatedUser.role})`,
      'UPDATE',
      'User',
      params.id,
      getClientIP(request),
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({
      success: true,
      data: updatedUser
    })

  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireSuperAdmin(request)
    if (auth instanceof NextResponse) return auth

    await connectToMongoose()

    // Find user
    const user = await User.findById(params.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting super-admin users
    if (user.role === 'super-admin') {
      return NextResponse.json(
        { error: 'Cannot delete super-admin users' },
        { status: 403 }
      )
    }

    // Soft delete - set isActive to false
    await User.findByIdAndUpdate(params.id, { 
      isActive: false,
      deletedAt: new Date(),
      deletedBy: auth.user.id
    })

    // Log audit action
    await logAuditAction(
      auth.user.id,
      `Deleted user: ${user.name} (${user.role})`,
      'DELETE',
      'User',
      params.id,
      getClientIP(request),
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
