import { NextRequest, NextResponse } from 'next/server'
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
    // Simple token verification
    const tokenResult = extractAndVerifyToken(request)
    if (!tokenResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create database connection
    const connection = await mysql.createConnection(dbConfig)

    try {
      // Get total patients count
      const [totalResult] = await connection.execute(
        'SELECT COUNT(*) as count FROM patients'
      ) as any[]
      const totalPatients = totalResult[0]?.count || 0

      // Get active patients count
      const [activeResult] = await connection.execute(
        'SELECT COUNT(*) as count FROM patients WHERE is_active = 1'
      ) as any[]
      const activeCases = activeResult[0]?.count || 0

      // Get critical patients (this is a placeholder - you might want to define criteria for critical patients)
      // For now, we'll use a random number or patients with specific conditions
      const criticalPatients = Math.floor(totalPatients * 0.05) // 5% of total patients as critical

      // Get follow-ups due (placeholder - you might want to check appointments table)
      // For now, we'll use a percentage of active patients
      const followUpsDue = Math.floor(activeCases * 0.15) // 15% of active patients need follow-up

      const stats = {
        totalPatients,
        activeCases,
        criticalPatients,
        followUpsDue
      }

      return NextResponse.json(stats)

    } finally {
      await connection.end()
    }

  } catch (error) {
    console.error('Error fetching patient stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
