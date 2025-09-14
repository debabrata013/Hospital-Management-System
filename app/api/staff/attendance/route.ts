import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { getServerSession } from '@/lib/auth-simple'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

// This enables dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// GET - Fetch staff attendance data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mock data for demonstration
    // In a real implementation, this would fetch from the database
    const today = new Date()
    const mockAttendance = generateAttendanceData(session.user.userId, today)

    return NextResponse.json({
      success: true,
      data: mockAttendance
    })
  } catch (error) {
    console.error('Error fetching attendance data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
}

// Helper function to generate mock attendance data
function generateAttendanceData(userId: string, today: Date) {
  const records = []
  
  // Generate past 30 days of attendance
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(today.getDate() - i)
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    // Randomize status with realistic probability
    const rand = Math.random()
    let status = 'present'
    let checkIn = `08:${Math.floor(Math.random() * 15).toString().padStart(2, '0')}:00`
    let checkOut = `17:${Math.floor(Math.random() * 30).toString().padStart(2, '0')}:00`
    
    if (rand > 0.9) {
      status = 'absent'
      checkIn = ''
      checkOut = ''
    } else if (rand > 0.8) {
      status = 'late'
      checkIn = `08:${Math.floor(Math.random() * 30 + 15).toString().padStart(2, '0')}:00`
    }
    
    records.push({
      date: date.toISOString().split('T')[0],
      checkIn,
      checkOut,
      status
    })
  }
  
  return records
}