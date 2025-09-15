import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/connection'

export const dynamic = 'force-dynamic'

let cache: any = null
let cacheAt = 0
const TTL_MS = 30000

export async function GET(request: NextRequest) {
  try {
    if (cache && Date.now() - cacheAt < TTL_MS) {
      return NextResponse.json(cache)
    }

    const rows = await executeQuery(`
      SELECT 
        u.id AS staff_id,
        u.name,
        u.role,
        COALESCE(u.department, 'General') AS department,
        ss.start_time,
        ss.end_time,
        ss.status AS shift_status,
        sp.work_location
      FROM users u
      LEFT JOIN staff_profiles sp ON sp.user_id = u.id
      LEFT JOIN staff_shifts ss ON ss.user_id = u.id AND ss.shift_date = CURDATE()
      WHERE u.role NOT LIKE '%patient%' AND u.role NOT LIKE '%doctor%' AND u.is_active = 1
      ORDER BY u.name ASC
      LIMIT 50
    `, [], { allowDuringBuild: true })
    const today = new Date().toISOString().slice(0,10)

    const shiftLabel = (start?: string | null): string => {
      if (!start) return 'Day Shift'
      const h = parseInt(String(start).split(':')[0] || '0', 10)
      if (h < 8) return 'Night Shift'
      if (h < 12) return 'Morning Shift'
      if (h < 18) return 'Day Shift'
      return 'Evening Shift'
    }

    const formatTime = (t?: string | null): string => {
      if (!t) return ''
      const [hh, mm] = String(t).split(':')
      const hour = parseInt(hh, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = ((hour + 11) % 12) + 1
      return `${hour12.toString().padStart(2, '0')}:${mm} ${ampm}`
    }

    const staff = (rows as any[]).map(r => ({
      id: `STAFF-${r.staff_id}`,
      name: r.name,
      role: r.role,
      department: r.department,
      shift: shiftLabel(r.start_time),
      startTime: formatTime(r.start_time) || '08:00 AM',
      endTime: formatTime(r.end_time) || '08:00 PM',
      status: r.shift_status === 'active' ? 'on_duty' : (r.shift_status || 'off_duty'),
      assignedWard: r.work_location || 'General Ward'
    }))

    const payload = { date: today, staff }
    cache = payload
    cacheAt = Date.now()
    return NextResponse.json(payload)
  } catch (error) {
    // @ts-ignore
    if (error?.code === 'ER_USER_LIMIT_REACHED' && cache) {
      return NextResponse.json(cache)
    }
    console.error('Error fetching staff duty:', error)
    return NextResponse.json({ staff: [] }, { status: 200 })
  }
}


