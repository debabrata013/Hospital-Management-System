import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

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

export async function GET(req: NextRequest) {
  try {
    // Simple token verification
    const tokenResult = extractAndVerifyToken(req)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    try {
      // Fetch AI approvals for the patient
      const query = `
        SELECT 
          id,
          patient_id,
          type,
          ai_generated_content,
          status,
          doctor_name,
          approved_at,
          created_at
        FROM ai_approvals 
        WHERE patient_id = ? AND status = 'approved'
        ORDER BY created_at DESC
      `

      const [results] = await connection.execute(query, [patientId]) as any[]

      const approvals = results.map((approval: any) => ({
        id: approval.id,
        patient_id: approval.patient_id,
        type: approval.type,
        content: approval.ai_generated_content,
        status: approval.status,
        approved_by: approval.doctor_name,
        approved_at: approval.approved_at,
        created_at: approval.created_at
      }))

      return NextResponse.json({
        success: true,
        approvals
      })

    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('Error fetching AI approvals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
