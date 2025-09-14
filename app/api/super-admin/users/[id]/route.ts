import { isStaticBuild } from '@/lib/api-utils';

// Force dynamic for development server
// Generate static parameters for build
export async function generateStaticParams() {
  // During static build, we provide a list of IDs to pre-render
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log('PUT request body:', body)
    
    const { 
      firstName,
      lastName,
      email, 
      contactNumber,
      role, 
      department,
      specialization,
      isActive
    } = body
    
    const name = `${firstName || ''} ${lastName || ''}`.trim()
    const id = params.id
    
    console.log('Processed data:', { id, name, email, contactNumber, role })
    
    if (!id || !email || !role) {
      console.log('Validation failed:', { id: !!id, email: !!email, role: !!role })
      return NextResponse.json(
        { error: 'Missing required fields: id, email, and role are required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Check if email exists for other users
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    )
    
    if ((existingUser as any[]).length > 0) {
      await connection.end()
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    // Update user - use name if provided, otherwise keep existing
    const updateQuery = name 
      ? `UPDATE users 
         SET name = ?, email = ?, role = ?, contact_number = ?, 
             department = ?, specialization = ?, is_active = ?
         WHERE id = ?`
      : `UPDATE users 
         SET email = ?, role = ?, contact_number = ?, 
             department = ?, specialization = ?, is_active = ?
         WHERE id = ?`
    
    const updateParams = name 
      ? [name, email, role, contactNumber || '', department || null, specialization || null, isActive !== undefined ? isActive : 1, id]
      : [email, role, contactNumber || '', department || null, specialization || null, isActive !== undefined ? isActive : 1, id]
    
    await connection.execute(updateQuery, updateParams)
    
    await connection.end()
    
    return NextResponse.json({ 
      success: true,
      message: 'User updated successfully' 
    })
    
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const connection = await mysql.createConnection(dbConfig)
    
    // Soft delete by setting is_active to 0
    await connection.execute(
      'UPDATE users SET is_active = 0 WHERE id = ?',
      [id]
    )
    
    await connection.end()
    
    return NextResponse.json({ 
      success: true,
      message: 'User deactivated successfully' 
    })
    
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
