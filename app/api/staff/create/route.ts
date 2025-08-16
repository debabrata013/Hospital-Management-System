import { NextRequest, NextResponse } from 'next/server';
import { StaffService } from '@/lib/services/staff';
import { getServerSession } from '@/lib/auth-simple';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const staffService = new StaffService();

// POST /api/staff/create - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!['admin', 'super-admin', 'hr_manager'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      contactNumber,
      role,
      department,
      designation,
      employeeId,
      specialization,
      experience,
      address,
      employment
    } = body;

    // Validation
    if (!name || !email || !password || !contactNumber || !role || !department) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, email, password, contactNumber, role, department'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId: employeeId || null }]
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: existingUser.email === email ? 'Email already exists' : 'Employee ID already exists'
      }, { status: 409 });
    }

    // Validate role
    const validRoles = ['doctor', 'staff', 'admin', 'receptionist', 'nurse'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate employee ID if not provided
    const finalEmployeeId = employeeId || `${department?.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}`;

    // Create user
    const user = new User({
      name,
      email,
      passwordHash: hashedPassword,
      contactNumber,
      role,
      department,
      designation,
      employeeId: finalEmployeeId,
      isActive: true,
      isVerified: true,
      createdAt: new Date()
    });

    await user.save();

    // Create staff profile
    const profileData = {
      userId: user._id,
      personalInfo: {
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        phone: contactNumber,
        email,
        address: address || {},
        emergencyContact: {
          name: '',
          relationship: '',
          phone: '',
          email: ''
        }
      },
      qualifications: {
        education: [],
        experience: experience || 0,
        certifications: [],
        skills: []
      },
      currentAssignment: {
        department,
        designation,
        employeeId: finalEmployeeId,
        joiningDate: employment?.joiningDate || new Date(),
        employmentType: employment?.employmentType || 'full-time',
        salary: employment?.salary || 0
      },
      employmentStatus: 'active',
      createdBy: session.user.id
    };

    const profile = await staffService.createStaffProfile(profileData, session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          employeeId: user.employeeId
        },
        profile
      },
      message: 'Staff member created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create staff member'
    }, { status: 500 });
  }
}
