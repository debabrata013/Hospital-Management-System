import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306')
}

export const dynamic = 'force-dynamic'

function parseIntParam(value: string | null, def: number) {
  const n = value ? parseInt(value) : NaN
  return Number.isFinite(n) && n >= 0 ? n : def
}

async function requireSuperAdmin(req: NextRequest) {
  let token = req.cookies.get('auth-token')?.value || req.cookies.get('auth-backup')?.value
  if (!token) throw new Error('NO_AUTH')
  const { payload } = await jwtVerify(token, JWT_SECRET)
  const role = String(payload.role || '').toLowerCase()
  if (role !== 'super-admin') throw new Error('FORBIDDEN')
  return payload
}

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin(req)

    const url = new URL(req.url)
    const page = parseIntParam(url.searchParams.get('page'), 1)
    const pageSize = Math.min(parseIntParam(url.searchParams.get('pageSize'), 20), 100)
    const offset = (page - 1) * pageSize

    const connection = await mysql.createConnection(dbConfig)
    // Ensure table exists (in case migration runs late)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_login_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        user_uid VARCHAR(50) NULL,
        user_name VARCHAR(255) NULL,
        email VARCHAR(255) NULL,
        role VARCHAR(50) NOT NULL,
        ip_address VARCHAR(100) NULL,
        user_agent VARCHAR(512) NULL,
        logged_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_logged_in_at (logged_in_at),
        INDEX idx_user_id (user_id),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    const [rows] = await connection.execute(
      `SELECT id, user_id, user_uid, user_name, email, role, ip_address, user_agent, logged_in_at
       FROM admin_login_logs
       ORDER BY logged_in_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    )

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) as count FROM admin_login_logs`
    )

    await connection.end()

    const total = (countRows as any[])[0]?.count || 0

    return NextResponse.json({
      success: true,
      data: rows,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (err: any) {
    if (err?.message === 'NO_AUTH') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (err?.message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    console.error('GET /api/super-admin/login-logs error:', err)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
