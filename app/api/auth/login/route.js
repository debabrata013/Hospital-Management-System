// Login API Route - MySQL Implementation
// Hospital Management System - Arogya Hospital

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../../../../lib/mysql-connection';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const query = `
      SELECT 
        u.id,
        u.user_id,
        u.name,
        u.email,
        u.password_hash,
        u.role,
        u.contact_number,
        u.department,
        u.specialization,
        u.is_active,
        u.is_verified,
        u.profile_image,
        u.two_factor_enabled,
        sp.employee_type,
        sp.work_location
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.user_id
      WHERE u.email = ? AND u.is_active = TRUE
    `;

    const users = await executeQuery(query, [email.toLowerCase()]);

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.is_verified) {
      return NextResponse.json(
        { success: false, message: 'Account not verified. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Update last login
    await executeQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Create JWT token
    const tokenPayload = {
      userId: user.id,
      userIdString: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: user.id,
      userId: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      contactNumber: user.contact_number,
      department: user.department,
      specialization: user.specialization,
      profileImage: user.profile_image,
      employeeType: user.employee_type,
      workLocation: user.work_location,
      twoFactorEnabled: user.two_factor_enabled
    };

    // Log successful login
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, ip_address, created_at) 
       VALUES (?, ?, 'LOGIN', 'auth', ?, CURRENT_TIMESTAMP)`,
      [
        `LOG${Date.now()}`,
        user.id,
        request.headers.get('x-forwarded-for') || 'unknown'
      ]
    );

    // Set HTTP-only cookie for token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
