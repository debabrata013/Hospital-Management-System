import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export const dynamic = 'force-dynamic'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(_request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig)

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const y = new Date(today)
    y.setDate(today.getDate() - 1)
    const yesterdayStr = y.toISOString().split('T')[0]

    // Daily patients
    const [todayPatientsRes] = await connection.execute(
      'SELECT COUNT(*) as c FROM patients WHERE DATE(created_at) = ?',
      [todayStr]
    )
    const [yesterdayPatientsRes] = await connection.execute(
      'SELECT COUNT(*) as c FROM patients WHERE DATE(created_at) = ?',
      [yesterdayStr]
    )
    const todayPatients = (todayPatientsRes as any)[0]?.c || 0
    const yesterdayPatients = (yesterdayPatientsRes as any)[0]?.c || 0
    const patientsGrowth = yesterdayPatients === 0 ? 100 : ((todayPatients - yesterdayPatients) / yesterdayPatients) * 100

    // Appointments stats for today
    const [scheduledRes] = await connection.execute(
      "SELECT COUNT(*) as c FROM appointments WHERE DATE(appointment_date) = ? AND status IN ('scheduled','confirmed')",
      [todayStr]
    )
    const [completedRes] = await connection.execute(
      "SELECT COUNT(*) as c FROM appointments WHERE DATE(appointment_date) = ? AND status = 'completed'",
      [todayStr]
    )
    const scheduled = (scheduledRes as any)[0]?.c || 0
    const completed = (completedRes as any)[0]?.c || 0
    const successRate = scheduled + completed === 0 ? 0 : (completed / (scheduled + completed)) * 100

    // Revenue today
    const [revenueRes] = await connection.execute(
      `SELECT COALESCE(SUM(
          CASE 
            WHEN payment_status = 'paid' THEN COALESCE(total_amount, 0)
            WHEN payment_status = 'partial' THEN COALESCE(paid_amount, 0)
            ELSE 0
          END
        ), 0) as amt
       FROM billing
       WHERE DATE(created_at) = ? AND payment_status IN ('paid','partial')` as any,
      [todayStr]
    )
    const revenueToday = Number((revenueRes as any)[0]?.amt || 0)

    // Staff on duty: distinct doctors with appointments today
    const [onDutyRes] = await connection.execute(
      'SELECT COUNT(DISTINCT doctor_id) as c FROM appointments WHERE DATE(appointment_date) = ?',
      [todayStr]
    )
    const staffOnDuty = (onDutyRes as any)[0]?.c || 0

    // Utilization proxy: completed vs total (scheduled+completed)
    const avgUtilization = successRate

    await connection.end()

    return NextResponse.json({
      dailyPatients: {
        today: todayPatients,
        yesterday: yesterdayPatients,
        growthPercent: Number(patientsGrowth.toFixed(1))
      },
      appointments: {
        scheduled,
        completed,
        successRate: Number(successRate.toFixed(0))
      },
      revenue: {
        today: revenueToday,
        target: 18000,
        achievement: Number(((revenueToday / 18000) * 100).toFixed(1))
      },
      staff: {
        onDuty: staffOnDuty,
        avgUtilization: Number(avgUtilization.toFixed(0)),
        performance: avgUtilization >= 85 ? 'Excellent' : avgUtilization >= 70 ? 'Good' : 'Average'
      }
    })
  } catch (error) {
    console.error('Admin KPIs error:', error)
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 })
  }
}


