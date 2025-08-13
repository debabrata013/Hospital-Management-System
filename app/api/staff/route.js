// Staff Management API Routes - MySQL Implementation
// Hospital Management System - Arogya Hospital

import { NextResponse } from 'next/server';
import { executeQuery, executeTransaction, dbUtils } from '../../../lib/mysql-connection.js';
import { verifyToken } from '../../../lib/auth-middleware.js';
import bcrypt from 'bcryptjs';

// GET - Fetch staff with filters
export async function GET(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    // Check permissions
    if (!['super-admin', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to view staff' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push(`(
        u.name LIKE ? OR 
        u.email LIKE ? OR 
        u.employee_id LIKE ? OR 
        u.contact_number LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (role) {
      whereConditions.push('u.role = ?');
      queryParams.push(role);
    }

    if (department) {
      whereConditions.push('u.department = ?');
      queryParams.push(department);
    }

    if (isActive !== null && isActive !== undefined) {
      whereConditions.push('u.is_active = ?');
      queryParams.push(isActive === 'true');
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users u 
      ${whereClause}
    `;
    const countResult = await executeQuery(countQuery, queryParams);
    const totalStaff = countResult[0].total;

    // Get staff with profile details
    const staffQuery = `
      SELECT 
        u.id,
        u.user_id,
        u.name,
        u.email,
        u.role,
        u.contact_number,
        u.address,
        u.date_of_birth,
        u.gender,
        u.employee_id,
        u.department,
        u.specialization,
        u.qualification,
        u.experience_years,
        u.license_number,
        u.is_active,
        u.is_verified,
        u.profile_image,
        u.emergency_contact,
        u.emergency_contact_name,
        u.joining_date,
        u.salary,
        u.shift_preference,
        u.two_factor_enabled,
        u.last_login,
        u.created_at,
        sp.employee_type,
        sp.reporting_manager_id,
        sp.work_location,
        sp.skills,
        sp.certifications,
        sp.languages_known,
        sp.bank_account_number,
        sp.bank_name,
        sp.ifsc_code,
        sp.pan_number,
        sp.aadhar_number,
        manager.name as reporting_manager_name
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.user_id
      LEFT JOIN users manager ON sp.reporting_manager_id = manager.id
      ${whereClause}
      ORDER BY u.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const staff = await executeQuery(staffQuery, [...queryParams, limit, offset]);

    // Get recent activities for each staff member
    for (let member of staff) {
      // Get recent shifts
      const recentShifts = await executeQuery(`
        SELECT 
          ss.shift_date,
          ss.shift_type,
          ss.status,
          ss.check_in_time,
          ss.check_out_time,
          ss.total_hours
        FROM staff_shifts ss
        WHERE ss.user_id = ?
        ORDER BY ss.shift_date DESC
        LIMIT 5
      `, [member.id]);

      // Get pending leave requests
      const pendingLeaves = await executeQuery(`
        SELECT 
          lr.leave_type,
          lr.start_date,
          lr.end_date,
          lr.total_days,
          lr.status
        FROM leave_requests lr
        WHERE lr.user_id = ? AND lr.status = 'pending'
        ORDER BY lr.start_date ASC
        LIMIT 3
      `, [member.id]);

      member.recent_shifts = recentShifts;
      member.pending_leaves = pendingLeaves;
      
      // Calculate age if date of birth is available
      if (member.date_of_birth) {
        member.age = Math.floor((new Date() - new Date(member.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        staff,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalStaff / limit),
          totalStaff,
          hasNextPage: page < Math.ceil(totalStaff / limit),
          hasPrevPage: page > 1
        },
        summary: {
          totalStaff,
          activeStaff: staff.filter(s => s.is_active).length,
          inactiveStaff: staff.filter(s => !s.is_active).length,
          unverifiedStaff: staff.filter(s => !s.is_verified).length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

// POST - Add new staff member
export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    // Check permissions
    if (!['super-admin', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to add staff' },
        { status: 403 }
      );
    }

    const staffData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'role', 'contactNumber'];
    for (const field of requiredFields) {
      if (!staffData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(staffData.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user with same email already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [staffData.email.toLowerCase()]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if employee ID is provided and unique
    if (staffData.employeeId) {
      const existingEmployee = await executeQuery(
        'SELECT id FROM users WHERE employee_id = ?',
        [staffData.employeeId]
      );

      if (existingEmployee.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Employee ID already exists' },
          { status: 409 }
        );
      }
    }

    // Generate unique user ID and employee ID if not provided
    const userId = dbUtils.generateId('USR');
    const employeeId = staffData.employeeId || dbUtils.generateId('EMP');

    // Hash password (use default password if not provided)
    const defaultPassword = staffData.password || 'Hospital@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    // Prepare user data
    const userInsertData = {
      user_id: userId,
      name: staffData.name,
      email: staffData.email.toLowerCase(),
      password_hash: passwordHash,
      role: staffData.role,
      contact_number: staffData.contactNumber,
      address: staffData.address || null,
      date_of_birth: staffData.dateOfBirth ? dbUtils.formatDate(staffData.dateOfBirth) : null,
      gender: staffData.gender || null,
      employee_id: employeeId,
      department: staffData.department || null,
      specialization: staffData.specialization || null,
      qualification: staffData.qualification || null,
      experience_years: staffData.experienceYears || 0,
      license_number: staffData.licenseNumber || null,
      is_active: staffData.isActive !== false, // Default to true
      is_verified: staffData.isVerified !== false, // Default to true
      emergency_contact: staffData.emergencyContact || null,
      emergency_contact_name: staffData.emergencyContactName || null,
      joining_date: staffData.joiningDate ? dbUtils.formatDate(staffData.joiningDate) : dbUtils.formatDate(new Date()),
      salary: staffData.salary || null,
      shift_preference: staffData.shiftPreference || 'flexible'
    };

    // Prepare staff profile data
    const profileData = {
      employee_type: staffData.employeeType || 'full-time',
      reporting_manager_id: staffData.reportingManagerId || null,
      work_location: staffData.workLocation || null,
      skills: staffData.skills || null,
      certifications: staffData.certifications || null,
      languages_known: staffData.languagesKnown || null,
      bank_account_number: staffData.bankAccountNumber || null,
      bank_name: staffData.bankName || null,
      ifsc_code: staffData.ifscCode || null,
      pan_number: staffData.panNumber || null,
      aadhar_number: staffData.aadharNumber || null
    };

    // Execute transaction
    const transactionQueries = [];

    // Insert user
    const { query: userQuery, params: userParams } = 
      dbUtils.buildInsertQuery('users', userInsertData);
    transactionQueries.push({ query: userQuery, params: userParams });

    const results = await executeTransaction(transactionQueries);
    const userDbId = results[0].insertId;

    // Insert staff profile
    profileData.user_id = userDbId;
    const { query: profileQuery, params: profileParams } = 
      dbUtils.buildInsertQuery('staff_profiles', profileData);
    await executeQuery(profileQuery, profileParams);

    // Set default permissions based on role
    const defaultPermissions = {
      'admin': ['patients', 'appointments', 'billing', 'inventory', 'reports', 'messages'],
      'doctor': ['patients', 'appointments', 'prescriptions', 'medical-records', 'messages'],
      'staff': ['patients', 'vitals', 'messages'],
      'receptionist': ['patients', 'appointments', 'billing', 'messages'],
      'pharmacy': ['medicines', 'prescriptions', 'inventory', 'messages']
    };

    const rolePermissions = defaultPermissions[staffData.role] || [];
    if (rolePermissions.length > 0) {
      for (const module of rolePermissions) {
        await executeQuery(
          `INSERT INTO user_permissions (user_id, module, permissions, created_at)
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [userDbId, module, JSON.stringify(['read', 'create', 'update'])]
        );
      }
    }

    // Log the creation
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, new_values, created_at) 
       VALUES (?, ?, 'CREATE', 'users', ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        userDbId.toString(),
        JSON.stringify({ ...userInsertData, profile: profileData })
      ]
    );

    // Create welcome notification
    await executeQuery(
      `INSERT INTO system_notifications (notification_id, user_id, notification_type, title, message, priority, created_at)
       VALUES (?, ?, 'welcome', ?, ?, 'medium', CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('NOT'),
        userDbId,
        'Welcome to Arogya Hospital',
        `Welcome ${staffData.name}! Your account has been created. Default password: ${defaultPassword}`
      ]
    );

    // Fetch the created staff member
    const createdStaff = await executeQuery(`
      SELECT 
        u.*,
        sp.employee_type,
        sp.work_location,
        sp.skills,
        sp.certifications
      FROM users u
      LEFT JOIN staff_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `, [userDbId]);

    return NextResponse.json({
      success: true,
      message: 'Staff member added successfully',
      data: {
        staff: createdStaff[0],
        defaultPassword: defaultPassword
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add staff member' },
      { status: 500 }
    );
  }
}

// PUT - Update staff member
export async function PUT(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('id');
    
    if (!staffId) {
      return NextResponse.json(
        { success: false, message: 'Staff ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Get existing staff member
    const existingStaff = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [staffId]
    );

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Check permissions (users can update their own profile, admins can update anyone)
    if (authResult.user.userId !== parseInt(staffId) && 
        !['super-admin', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to update this staff member' },
        { status: 403 }
      );
    }

    // Prepare user update data
    const userUpdateFields = {};
    if (updateData.name) userUpdateFields.name = updateData.name;
    if (updateData.contactNumber) userUpdateFields.contact_number = updateData.contactNumber;
    if (updateData.address !== undefined) userUpdateFields.address = updateData.address;
    if (updateData.dateOfBirth !== undefined) userUpdateFields.date_of_birth = updateData.dateOfBirth ? dbUtils.formatDate(updateData.dateOfBirth) : null;
    if (updateData.gender !== undefined) userUpdateFields.gender = updateData.gender;
    if (updateData.department !== undefined) userUpdateFields.department = updateData.department;
    if (updateData.specialization !== undefined) userUpdateFields.specialization = updateData.specialization;
    if (updateData.qualification !== undefined) userUpdateFields.qualification = updateData.qualification;
    if (updateData.experienceYears !== undefined) userUpdateFields.experience_years = updateData.experienceYears;
    if (updateData.licenseNumber !== undefined) userUpdateFields.license_number = updateData.licenseNumber;
    if (updateData.emergencyContact !== undefined) userUpdateFields.emergency_contact = updateData.emergencyContact;
    if (updateData.emergencyContactName !== undefined) userUpdateFields.emergency_contact_name = updateData.emergencyContactName;
    if (updateData.salary !== undefined) userUpdateFields.salary = updateData.salary;
    if (updateData.shiftPreference !== undefined) userUpdateFields.shift_preference = updateData.shiftPreference;

    // Only admins can update these fields
    if (['super-admin', 'admin'].includes(authResult.user.role)) {
      if (updateData.role !== undefined) userUpdateFields.role = updateData.role;
      if (updateData.isActive !== undefined) userUpdateFields.is_active = updateData.isActive;
      if (updateData.isVerified !== undefined) userUpdateFields.is_verified = updateData.isVerified;
    }

    userUpdateFields.updated_at = new Date();

    // Prepare profile update data
    const profileUpdateFields = {};
    if (updateData.employeeType !== undefined) profileUpdateFields.employee_type = updateData.employeeType;
    if (updateData.reportingManagerId !== undefined) profileUpdateFields.reporting_manager_id = updateData.reportingManagerId;
    if (updateData.workLocation !== undefined) profileUpdateFields.work_location = updateData.workLocation;
    if (updateData.skills !== undefined) profileUpdateFields.skills = updateData.skills;
    if (updateData.certifications !== undefined) profileUpdateFields.certifications = updateData.certifications;
    if (updateData.languagesKnown !== undefined) profileUpdateFields.languages_known = updateData.languagesKnown;
    if (updateData.bankAccountNumber !== undefined) profileUpdateFields.bank_account_number = updateData.bankAccountNumber;
    if (updateData.bankName !== undefined) profileUpdateFields.bank_name = updateData.bankName;
    if (updateData.ifscCode !== undefined) profileUpdateFields.ifsc_code = updateData.ifscCode;
    if (updateData.panNumber !== undefined) profileUpdateFields.pan_number = updateData.panNumber;
    if (updateData.aadharNumber !== undefined) profileUpdateFields.aadhar_number = updateData.aadharNumber;

    profileUpdateFields.updated_at = new Date();

    // Execute updates
    const transactionQueries = [];

    // Update user
    if (Object.keys(userUpdateFields).length > 1) { // More than just updated_at
      const { query: userQuery, params: userParams } = 
        dbUtils.buildUpdateQuery('users', userUpdateFields, { id: staffId });
      transactionQueries.push({ query: userQuery, params: userParams });
    }

    // Update profile
    if (Object.keys(profileUpdateFields).length > 1) { // More than just updated_at
      const { query: profileQuery, params: profileParams } = 
        dbUtils.buildUpdateQuery('staff_profiles', profileUpdateFields, { user_id: staffId });
      transactionQueries.push({ query: profileQuery, params: profileParams });
    }

    if (transactionQueries.length > 0) {
      await executeTransaction(transactionQueries);
    }

    // Handle password update if provided
    if (updateData.newPassword) {
      const passwordHash = await bcrypt.hash(updateData.newPassword, 12);
      await executeQuery(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [passwordHash, staffId]
      );
    }

    // Log the update
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, new_values, created_at) 
       VALUES (?, ?, 'UPDATE', 'users', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        staffId,
        JSON.stringify(existingStaff[0]),
        JSON.stringify({ user: userUpdateFields, profile: profileUpdateFields })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Staff member updated successfully'
    });

  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE - Deactivate staff member
export async function DELETE(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    // Check permissions
    if (!['super-admin', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions to delete staff' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('id');
    
    if (!staffId) {
      return NextResponse.json(
        { success: false, message: 'Staff ID is required' },
        { status: 400 }
      );
    }

    // Get existing staff member
    const existingStaff = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [staffId]
    );

    if (existingStaff.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (authResult.user.userId === parseInt(staffId)) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if staff has active appointments or responsibilities
    const activeAppointments = await executeQuery(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE doctor_id = ? AND status IN ('scheduled', 'confirmed', 'in-progress')`,
      [staffId]
    );

    if (activeAppointments[0].count > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete staff member with active appointments' },
        { status: 400 }
      );
    }

    // Soft delete staff member
    await executeQuery(
      'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [staffId]
    );

    // Log the deletion
    await executeQuery(
      `INSERT INTO audit_logs (log_id, user_id, action, resource_type, resource_id, old_values, created_at) 
       VALUES (?, ?, 'DELETE', 'users', ?, ?, CURRENT_TIMESTAMP)`,
      [
        dbUtils.generateId('LOG'),
        authResult.user.userId,
        staffId,
        JSON.stringify(existingStaff[0])
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Staff member deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete staff member' },
      { status: 500 }
    );
  }
}
