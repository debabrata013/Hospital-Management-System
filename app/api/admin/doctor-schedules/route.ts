import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'

export const dynamic = 'force-dynamic'

let cache: any = null
let cacheAt = 0
const TTL_MS = 30000

export async function GET(request: NextRequest) {
  try {
    // Serve cached response if fresh
    if (cache && Date.now() - cacheAt < TTL_MS) {
      return NextResponse.json(cache)
    }

    // Pull doctors with today's shift and counts (pooled)
    const rows = await executeQuery(`
      SELECT 
        u.id AS doctor_id,
        u.name AS doctor_name,
        COALESCE(u.department, 'General Medicine') AS department,
        COALESCE(u.specialization, 'General') AS specialization,
        ss.start_time,
        ss.end_time,
        ss.status AS shift_status,
        -- Count total patients scheduled for this doctor today
        (
          SELECT COUNT(*) FROM appointments a
          WHERE a.doctor_id = u.id AND a.appointment_date = CURDATE()
        ) AS patients_scheduled,
        -- In-progress determines "busy"
        (
          SELECT COUNT(*) FROM appointments a2
          WHERE a2.doctor_id = u.id AND a2.appointment_date = CURDATE() AND a2.status = 'in-progress'
        ) AS in_progress_count,
        -- Room (if any recent or today appointment has room_number)
        (
          SELECT a3.room_number FROM appointments a3
          WHERE a3.doctor_id = u.id AND a3.appointment_date = CURDATE() AND a3.room_number IS NOT NULL
          ORDER BY a3.appointment_time DESC LIMIT 1
        ) AS room_number
      FROM users u
      LEFT JOIN staff_shifts ss ON ss.user_id = u.id AND ss.shift_date = CURDATE()
      WHERE u.role = 'doctor' AND u.is_active = 1
      ORDER BY u.name ASC
    `, [], { allowDuringBuild: true })

    const mapShiftLabel = (start?: string | null, end?: string | null): string => {
      if (!start || !end) return 'Full Day'
      const h = parseInt(String(start).split(':')[0] || '0', 10)
      if (h < 12) return 'Morning'
      if (h < 18) return 'Evening'
      return 'Night'
    }

    const formatTime = (t?: string | null): string => {
      if (!t) return ''
      const [hh, mm] = String(t).split(':')
      const hour = parseInt(hh, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = ((hour + 11) % 12) + 1
      return `${hour12.toString().padStart(2, '0')}:${mm} ${ampm}`
    }

    const schedules = (rows as any[]).map((r) => {
      const shift = mapShiftLabel(r.start_time, r.end_time)
      const isBusy = Number(r.in_progress_count || 0) > 0
      const status = r.shift_status === 'active' ? (isBusy ? 'busy' : 'available') : (r.shift_status || 'on_leave')
      const maxPatients = 12
      return {
        id: `SCH-${r.doctor_id}`,
        doctorName: r.doctor_name,
        department: r.department,
        specialization: r.specialization,
        shift,
        startTime: formatTime(r.start_time) || '08:00 AM',
        endTime: formatTime(r.end_time) || '04:00 PM',
        room: r.room_number || 'OPD',
        status,
        patientsScheduled: Number(r.patients_scheduled || 0),
        maxPatients
      }
    })

    const payload = { date: new Date().toISOString().slice(0,10), schedules }
    cache = payload
    cacheAt = Date.now()
    return NextResponse.json(payload)
  } catch (error) {
    // If rate-limited and we have cache, return it
    // @ts-ignore
    if (error?.code === 'ER_USER_LIMIT_REACHED' && cache) {
      return NextResponse.json(cache)
    }
    console.error('Error fetching doctor schedules:', error)
    return NextResponse.json({ schedules: [] }, { status: 200 })
  }
}
