import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
  contactNumber: z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
  role: z.enum(['doctor', 'staff', 'receptionist', 'patient']),
  department: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().default('India')
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    contactNumber: z.string().optional()
  }).optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export async function POST(request: NextRequest) {
  let body: any = {};
  
  try {
    await connectDB();

    body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      contactNumber,
      role,
      department,
      specialization,
      licenseNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContact
    } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { contactNumber }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: existingUser.email === email.toLowerCase() 
            ? 'Email already registered' 
            : 'Phone number already registered'
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate unique user ID
    const userCount = await User.countDocuments();
    const userId = `USR${String(userCount + 1).padStart(6, '0')}`;

    // Create user object
    const userData = {
      userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      contactNumber,
      role,
      department: department || getDefaultDepartment(role),
      specialization,
      licenseNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      emergencyContact,
      isActive: role === 'patient' ? true : false, // Patients auto-active, staff needs approval
      isEmailVerified: false,
      isPhoneVerified: false,
      registrationDate: new Date(),
      lastLogin: null,
      loginCount: 0,
      permissions: getDefaultPermissions(role),
      preferences: {
        language: 'english',
        theme: 'light',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      }
    };

    // Add role-specific required fields
    if (role === 'doctor') {
      userData.experience = 0; // Default to 0 years, can be updated later
      userData.workSchedule = {
        consultationFee: 500, // Default consultation fee
        maxPatientsPerDay: 20,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      };
      userData.employment = {
        salary: 50000, // Default salary, can be updated later
        employmentType: 'full-time'
      };
    } else if (['staff', 'admin', 'receptionist'].includes(role)) {
      userData.employment = {
        salary: 25000, // Default salary for staff roles
        employmentType: 'full-time'
      };
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Generate JWT token for immediate login (if patient) or verification
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Log registration
    const logCount = await AuditLog.countDocuments();
    const logId = `LOG${String(logCount + 1).padStart(8, '0')}`;
    
    await AuditLog.create({
      logId,
      userId: user._id,
      userRole: user.role,
      userName: user.name,
      action: `User registered: ${user.email}`,
      actionType: 'CREATE',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: getClientIP(request),
      deviceInfo: {
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      riskLevel: 'LOW'
    });

    // Send welcome email (mock for now)
    await sendWelcomeEmail(user);

    // Prepare response
    const responseData = {
      success: true,
      message: role === 'patient' 
        ? 'Registration successful! You can now login.'
        : 'Registration successful! Your account is pending approval.',
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        needsApproval: !user.isActive
      }
    };

    const response = NextResponse.json(responseData, { status: 201 });

    // Set auth cookie if user is active (patients)
    if (user.isActive) {
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });

    // TODO: Implement system audit logging for failed registrations
    // Currently skipped due to userId requirement in AuditLog model

    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email or phone number already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Registration failed. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

function getDefaultDepartment(role: string): string {
  const departmentMap: Record<string, string> = {
    'doctor': 'General Medicine',
    'staff': 'Administration',
    'receptionist': 'Front Desk',
    'patient': 'N/A'
  };
  
  return departmentMap[role] || 'General';
}

function getDefaultPermissions(role: string) {
  const permissionMap: Record<string, any[]> = {
    'doctor': [
      { module: 'patients', actions: ['create', 'read', 'update'] },
      { module: 'appointments', actions: ['read', 'update'] },
      { module: 'billing', actions: ['read'] },
      { module: 'reports', actions: ['read'] }
    ],
    'staff': [
      { module: 'patients', actions: ['create', 'read', 'update'] },
      { module: 'appointments', actions: ['create', 'read', 'update'] },
      { module: 'billing', actions: ['create', 'read', 'update'] },
      { module: 'inventory', actions: ['read', 'update'] }
    ],
    'receptionist': [
      { module: 'patients', actions: ['create', 'read', 'update'] },
      { module: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'billing', actions: ['create', 'read'] }
    ],
    'patient': [
      { module: 'appointments', actions: ['create', 'read'] },
      { module: 'billing', actions: ['read'] }
    ]
  };
  
  return permissionMap[role] || [];
}

async function sendWelcomeEmail(user: any): Promise<void> {
  // Mock email sending - in production, integrate with actual email service
  console.log(`Welcome email sent to ${user.email}`);
  
  // You can integrate with services like:
  // - SendGrid
  // - AWS SES
  // - Nodemailer with SMTP
  
  try {
    // Example with nodemailer (if configured)
    // const transporter = nodemailer.createTransporter({...});
    // await transporter.sendMail({
    //   to: user.email,
    //   subject: 'Welcome to आरोग्य अस्पताल',
    //   html: generateWelcomeEmailTemplate(user)
    // });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}
