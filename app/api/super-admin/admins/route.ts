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

// GET - Fetch all admins
export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig)
    
    const [admins] = await connection.execute(`
      SELECT 
        id, user_id, name, email, contact_number, department, 
        is_active, created_at, last_login
      FROM users 
      WHERE role = 'admin'
      ORDER BY created_at DESC
    `)
    
    await connection.end()
    
    return NextResponse.json({
      success: true,
      admins: (admins as any[]).map(admin => ({
        id: admin.id,
        user_id: admin.user_id,
        name: admin.name,
        email: admin.email,
        mobile: admin.contact_number,
        department: admin.department,
        isActive: admin.is_active === 1,
        createdAt: admin.created_at,
        lastLogin: admin.last_login
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
    
    // Debug logging
    console.log('Admin creation request received:')
    console.log('Name:', name)
    console.log('Mobile:', mobile, 'Type:', typeof mobile, 'Length:', mobile?.length)
    console.log('Password:', password, 'Type:', typeof password, 'Length:', password?.length)
    
    // Validate input
    if (!name || !mobile || !password) {
      console.log('Validation failed: Missing fields')
      return NextResponse.json(
        { success: false, error: 'Name, mobile, and password are required' },
        { status: 400 }
      )
    }
    
    // Validate mobile number (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      console.log('Validation failed: Invalid mobile format')
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      )
    }
    
    // Validate password (6 digits)
    if (!/^\d{6}$/.test(password)) {
      console.log('Validation failed: Invalid password format')
      return NextResponse.json(
        { success: false, error: 'Password must be exactly 6 digits' },
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
    
    // Generate new admin ID
    const [lastAdmin] = await connection.execute(
      'SELECT user_id FROM users WHERE role = "admin" ORDER BY id DESC LIMIT 1'
    )
    
    let nextNumber = 1
    if ((lastAdmin as any[]).length > 0) {
      const lastUserId = (lastAdmin as any)[0].user_id
      const match = lastUserId.match(/AD(\d+)/)
      if (match) {
        nextNumber = parseInt(match[1]) + 1
      }
    }
    
    const userId = `AD${nextNumber.toString().padStart(3, '0')}`
    const email = `${userId.toLowerCase()}@hospital.com`
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Insert new admin
    const [result] = await connection.execute(`
      INSERT INTO users (
        user_id, name, email, contact_number, password_hash, role, 
        department, is_active, is_verified, created_at
      ) VALUES (?, ?, ?, ?, ?, 'admin', 'Administration', 1, 1, NOW())
    `, [userId, name, email, mobile, hashedPassword])
    
    await connection.end()
    
    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: (result as any).insertId,
        user_id: userId,
        name: name,
        email: email,
        mobile: mobile,
        department: 'Administration'
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
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if mobile already exists for other users
    if (mobile) {
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE contact_number = ? AND id != ?',
        [mobile, id]
      )
      
      if ((existingUsers as any[]).length > 0) {
        await connection.end()
        return NextResponse.json(
          { success: false, error: 'Mobile number already exists' },
          { status: 400 }
        )
      }
    }
    
    // Build update query
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
    
    updateValues.push(id)
    
    // Update admin
    await connection.execute(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND role = 'admin'
    `, updateValues)
    
    // Get updated admin data
    const [updatedAdmin] = await connection.execute(
      'SELECT id, user_id, name, email, contact_number, department FROM users WHERE id = ?',
      [id]
    )
    
    await connection.end()
    
    const admin = (updatedAdmin as any[])[0]
    
    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        id: admin.id,
        user_id: admin.user_id,
        name: admin.name,
        email: admin.email,
        mobile: admin.contact_number,
        department: admin.department
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
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Delete admin from database
    await connection.execute(
      'DELETE FROM users WHERE id = ? AND role = "admin"',
      [id]
    )
    
    await connection.end()
    
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
