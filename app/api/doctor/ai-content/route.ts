import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management'
}

// Simple token extraction and verification
function extractAndVerifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      const tokenCookie = request.cookies.get('auth-token')
      if (tokenCookie) {
        token = tokenCookie.value
      }
    }

    if (!token) {
      return { success: false, error: 'No token provided' }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (!decoded || !decoded.userId) {
      return { success: false, error: 'Invalid token' }
    }

    return { success: true, userId: decoded.userId }
  } catch (error) {
    return { success: false, error: 'Token verification failed' }
  }
}

export async function GET(request: NextRequest) {
  try {
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patient_id')

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      // Query AI-generated content from ai_approvals table
      // Search by both patient_id and patient_name to handle different ID formats
      const query = `
        SELECT 
          id,
          patient_id,
          doctor_id,
          type,
          ai_generated_content as content,
          status,
          created_at,
          approved_at as updated_at
        FROM ai_approvals
        WHERE (patient_id = ? OR patient_name = ?) AND status = 'approved'
        ORDER BY created_at DESC
      `

      console.log('Fetching AI content for patient:', patientId)
      
      // First, try to find the patient name from the patient ID
      // Check if we can find a patient with this ID to get their name
      let patientName = patientId;
      try {
        const [patientRows] = await connection.execute(
          'SELECT name FROM patients WHERE patient_id = ? OR id = ?', 
          [patientId, patientId]
        ) as any[]
        if (patientRows.length > 0) {
          patientName = patientRows[0].name;
          console.log('Found patient name:', patientName);
        }
      } catch (e) {
        console.log('Could not find patient name, using ID as fallback');
      }
      
      const [aiContent] = await connection.execute(query, [patientId, patientName]) as any[]
      console.log('Found AI content:', aiContent)

      return NextResponse.json({
        success: true,
        content: aiContent || []
      })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error fetching AI content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { patient_id, type, content, doctor_notes, status = 'pending' } = body

    if (!patient_id || !type || !content) {
      return NextResponse.json(
        { error: 'Patient ID, type, and content are required' },
        { status: 400 }
      )
    }

    if (!['summary', 'diet_plan'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "summary" or "diet_plan"' },
        { status: 400 }
      )
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      // Insert new AI content
      const insertQuery = `
        INSERT INTO ai_content (
          patient_id, doctor_id, type, content, doctor_notes, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `

      const [result] = await connection.execute(insertQuery, [
        patient_id,
        tokenResult.userId,
        type,
        content,
        doctor_notes || null,
        status
      ]) as any[]

      return NextResponse.json({
        success: true,
        message: 'AI content saved successfully',
        contentId: result.insertId
      })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error saving AI content:', error)
    return NextResponse.json(
      { error: 'Failed to save AI content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, content } = body

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      let updateQuery = 'UPDATE ai_content SET updated_at = NOW()'
      const updateParams = []

      if (status) {
        updateQuery += ', status = ?'
        updateParams.push(status)
      }

      if (content) {
        updateQuery += ', content = ?'
        updateParams.push(content)
      }

      updateQuery += ' WHERE id = ?'
      updateParams.push(id)

      await connection.execute(updateQuery, updateParams)

      return NextResponse.json({
        success: true,
        message: 'AI content updated successfully'
      })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error updating AI content:', error)
    return NextResponse.json(
      { error: 'Failed to update AI content' },
      { status: 500 }
    )
  }
}
