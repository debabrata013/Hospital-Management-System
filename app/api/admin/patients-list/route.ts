import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
}

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig)

    // Detect available columns
    const [cols] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'patients'
    `, [process.env.DB_NAME || 'hospital_management'])
    const available = new Set((cols as any[]).map(c => c.COLUMN_NAME))

    const fields: string[] = []
    ;(['id','name','patient_id','contact_number','date_of_birth','gender','is_active'] as const).forEach(c => {
      if (available.has(c)) fields.push(c)
    })
    if (fields.length === 0) fields.push('id','name')

    let query = `SELECT ${fields.join(', ')} FROM patients`
    if (available.has('is_active')) {
      query += ' WHERE is_active = 1'
    }
    query += ' ORDER BY name ASC'

    const [rows] = await connection.execute(query)

    await connection.end()

    // Normalize payload
    const list = (rows as any[]).map(r => ({
      id: r.id,
      name: r.name,
      patient_id: r.patient_id || r.patientId || '',
      contact_number: r.contact_number || r.phone || '',
      date_of_birth: r.date_of_birth || null,
      gender: r.gender || 'Unknown',
      is_active: r.is_active !== undefined ? r.is_active : 1
    }))

    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching patients list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients list' },
      { status: 500 }
    )
  }
}
