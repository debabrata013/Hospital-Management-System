import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

// GET - Fetch all staff
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffType = searchParams.get('type') || 'all' // all, pharmacy, receptionist, staff, cleaning

    const connection = await mysql.createConnection(dbConfig)
    
    let query = `
      SELECT 
        id, user_id, name, email, contact_number, role, department, 
        specialization, is_active, created_at, last_login, shift_preference
      FROM users 
      WHERE role IN ('pharmacy', 'receptionist', 'nurse')
    `
    
    if (staffType !== 'all') {
      query += ` AND role = '${staffType}'`
    }
    
    query += ` ORDER BY created_at DESC`
    
    const [staff] = await connection.execute(query)
    
    // Also get cleaning staff from separate table
    let cleaningStaff: any[] = []
    if (staffType === 'all' || staffType === 'cleaning') {
      const [cleaning] = await connection.execute(`
        SELECT id, name, email, phone as contact_number, status, shift, 
               specialization, created_at
        FROM cleaning_staff
        ORDER BY created_at DESC
      `)
      cleaningStaff = (cleaning as any[]).map(staff => ({
        id: staff.id,
        user_id: `CS${staff.id.toString().padStart(3, '0')}`,
        name: staff.name,
        email: staff.email,
        mobile: staff.contact_number,
        role: 'cleaning',
        department: 'Housekeeping',
        specialization: staff.specialization,
        isActive: staff.status !== 'Off Duty',
        createdAt: staff.created_at,
        lastLogin: null,
        shift: staff.shift
      }))
    }
    
    await connection.end()
    
    const allStaff = [
      ...(staff as any[]).map(s => ({
        id: s.id,
        user_id: s.user_id,
        name: s.name,
        email: s.email,
        mobile: s.contact_number,
        role: s.role,
        department: s.department || s.specialization,
        isActive: s.is_active === 1,
        createdAt: s.created_at,
        lastLogin: s.last_login,
        shift: s.shift_preference
      })),
      ...cleaningStaff
    ]
    
    return NextResponse.json({
      success: true,
      staff: allStaff
    })
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

// POST - Create new staff
export async function POST(request: NextRequest) {
  try {
    const { name, mobile, password, role, department, shift, specialization } = await request.json()
    
    // Validate input
    if (!name || !mobile || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, mobile, password, and role are required' },
        { status: 400 }
      )
    }
    
    // Validate mobile number (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number starting with 6-9' },
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
    
    // Validate role
    if (!['pharmacy', 'receptionist', 'nurse', 'cleaning'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if mobile already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE contact_number = ?',
      [mobile]
    )
    
    if ((existingUsers as any[]).length > 0) {
      await connection.end()
      return NextResponse.json(
        { success: false, error: 'Mobile number already exists' },
        { status: 400 }
      )
    }
    
    let result, userId, email, newStaff
    
    if (role === 'cleaning') {
      // Insert into cleaning_staff table
      email = `cleaning${Date.now()}@hospital.com`
      const [cleaningResult] = await connection.execute(`
        INSERT INTO cleaning_staff (
          name, email, phone, status, shift, specialization, 
          current_tasks, max_tasks, created_at
        ) VALUES (?, ?, ?, 'Available', ?, ?, 0, 5, NOW())
      `, [name, email, mobile, shift || 'Morning', specialization || 'General Cleaning'])
      
      result = cleaningResult
      userId = `CS${(result as any).insertId.toString().padStart(3, '0')}`
      
      newStaff = {
        id: (result as any).insertId,
        user_id: userId,
        name: name,
        email: email,
        mobile: mobile,
        role: 'cleaning',
        department: 'Housekeeping',
        shift: shift || 'Morning',
        specialization: specialization || 'General Cleaning'
      }
    } else {
      // Generate user ID based on role
      let prefix = 'NR'
      if (role === 'pharmacy') prefix = 'PH'
      else if (role === 'receptionist') prefix = 'RC'
      
      // Get all existing user_ids with this prefix to find the next available number
      const [existingIds] = await connection.execute(
        'SELECT user_id FROM users WHERE user_id LIKE ? ORDER BY user_id',
        [`${prefix}%`]
      )
      
      let nextNumber = 1
      const existingNumbers = (existingIds as any[])
        .map(row => {
          const match = row.user_id.match(new RegExp(`${prefix}(\\d+)`))
          return match ? parseInt(match[1]) : 0
        })
        .filter(num => num > 0)
        .sort((a, b) => a - b)
      
      // Find the first gap or use the next number after the highest
      for (let i = 0; i < existingNumbers.length; i++) {
        if (existingNumbers[i] !== i + 1) {
          nextNumber = i + 1
          break
        }
      }
      if (nextNumber === 1 && existingNumbers.length > 0) {
        nextNumber = Math.max(...existingNumbers) + 1
      }
      
      userId = `${prefix}${nextNumber.toString().padStart(3, '0')}`
      email = `${userId.toLowerCase()}@hospital.com`
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Insert into users table - try explicit role update after insert
      const [userResult] = await connection.execute(`
        INSERT INTO users (
          user_id, name, email, contact_number, password_hash, 
          department, specialization, shift_preference, is_active, is_verified, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW())
      `, [userId, name, email, mobile, hashedPassword, 
          department || (role === 'pharmacy' ? 'Pharmacy' : role === 'receptionist' ? 'Reception' : 'Nursing'),
          specialization || '', shift || 'flexible'])
      
      // Explicitly update the role field
      await connection.execute(`
        UPDATE users SET role = ? WHERE user_id = ?
      `, [role, userId])
      
      // Also fix existing nurse records that have blank roles
      await connection.execute(`
        UPDATE users SET role = 'nurse' WHERE user_id LIKE 'NR%' AND (role IS NULL OR role = '')
      `)
      
      result = userResult
      
      newStaff = {
        id: (result as any).insertId,
        user_id: userId,
        name: name,
        email: email,
        mobile: mobile,
        role: role,
        department: department || (role === 'pharmacy' ? 'Pharmacy' : role === 'receptionist' ? 'Reception' : 'Nursing'),
        shift: shift || 'flexible',
        specialization: specialization || ''
      }
    }
    
    await connection.end()
    
    return NextResponse.json({
      success: true,
      message: 'Staff created successfully',
      staff: newStaff
    })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { success: false, error: 'Database error: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// PUT - Update staff
export async function PUT(request: NextRequest) {
  try {
    const { id, name, mobile, password, role, department, shift, specialization } = await request.json()
    
    if (!id || !role) {
      return NextResponse.json(
        { success: false, error: 'ID and role are required' },
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
    
    const connection = await mysql.createConnection(dbConfig)
    
    if (role === 'cleaning') {
      // Update cleaning_staff table
      let updateFields = []
      let updateValues = []
      
      if (name) {
        updateFields.push('name = ?')
        updateValues.push(name)
      }
      if (mobile) {
        updateFields.push('phone = ?')
        updateValues.push(mobile)
      }
      if (shift) {
        updateFields.push('shift = ?')
        updateValues.push(shift)
      }
      if (specialization) {
        updateFields.push('specialization = ?')
        updateValues.push(specialization)
      }
      
      updateValues.push(id)
      
      await connection.execute(`
        UPDATE cleaning_staff 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues)
      
      const [updatedStaff] = await connection.execute(
        'SELECT * FROM cleaning_staff WHERE id = ?',
        [id]
      )
      
      const staff = (updatedStaff as any[])[0]
      
      await connection.end()
      
      return NextResponse.json({
        success: true,
        message: 'Staff updated successfully',
        staff: {
          id: staff.id,
          user_id: `CS${staff.id.toString().padStart(3, '0')}`,
          name: staff.name,
          email: staff.email,
          mobile: staff.phone,
          role: 'cleaning',
          department: 'Housekeeping',
          shift: staff.shift,
          specialization: staff.specialization
        }
      })
    } else {
      // Update users table
      let updateFields = []
      let updateValues = []
      
      if (name) {
        updateFields.push('name = ?')
        updateValues.push(name)
      }
      if (mobile) {
        updateFields.push('contact_number = ?')
        updateValues.push(mobile)
      }
      if (password) {
        updateFields.push('password_hash = ?')
        updateValues.push(await bcrypt.hash(password, 10))
      }
      if (department) {
        updateFields.push('department = ?')
        updateValues.push(department)
      }
      if (shift) {
        updateFields.push('shift_preference = ?')
        updateValues.push(shift)
      }
      if (specialization) {
        updateFields.push('specialization = ?')
        updateValues.push(specialization)
      }
      
      updateValues.push(id)
      
      await connection.execute(`
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = ? AND role IN ('pharmacy', 'receptionist', 'nurse')
      `, updateValues)
      
      const [updatedStaff] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      )
      
      const staff = (updatedStaff as any[])[0]
      
      await connection.end()
      
      return NextResponse.json({
        success: true,
        message: 'Staff updated successfully',
        staff: {
          id: staff.id,
          user_id: staff.user_id,
          name: staff.name,
          email: staff.email,
          mobile: staff.contact_number,
          role: staff.role,
          department: staff.department,
          shift: staff.shift_preference,
          specialization: staff.specialization
        }
      })
    }
  } catch (error) {
    console.error('Error updating staff:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update staff' },
      { status: 500 }
    )
  }
}

// DELETE - Delete staff
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '0')
    const role = searchParams.get('role')
    
    if (!id || !role) {
      return NextResponse.json(
        { success: false, error: 'ID and role are required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    if (role === 'cleaning') {
      await connection.execute('DELETE FROM cleaning_staff WHERE id = ?', [id])
    } else {
      await connection.execute(
        'DELETE FROM users WHERE id = ? AND role IN ("pharmacy", "receptionist", "nurse")',
        [id]
      )
    }
    
    await connection.end()
    
    return NextResponse.json({
      success: true,
      message: 'Staff deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting staff:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete staff' },
      { status: 500 }
    )
  }
}
