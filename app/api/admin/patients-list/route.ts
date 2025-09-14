import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../../../../lib/db/connection'

export async function GET(request: NextRequest) {
  try {
    // First try to get basic patient data with a simple query
    let rows;
    try {
      // Try the optimized query first
      const cols = await executeQuery(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'patients'
      `, [process.env.DB_NAME || 'hospital_management'])
      
      if (!cols || !Array.isArray(cols)) {
        throw new Error('Failed to get column information');
      }

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
      query += ' ORDER BY name ASC LIMIT 100'

      rows = await executeQuery(query)
    } catch (columnError) {
      console.warn('Column detection failed, using fallback query:', columnError)
      // Fallback to basic query
      rows = await executeQuery(`
        SELECT id, name, 
               COALESCE(patient_id, '') as patient_id,
               COALESCE(contact_number, '') as contact_number,
               date_of_birth, gender,
               COALESCE(is_active, 1) as is_active
        FROM patients 
        WHERE COALESCE(is_active, 1) = 1 
        ORDER BY name ASC 
        LIMIT 100
      `)
    }

    if (!rows || !Array.isArray(rows)) {
      console.error('Invalid rows result:', rows)
      return NextResponse.json([])
    }

    // Normalize payload
    const list = (rows as any[]).map(r => ({
      id: r.id || 0,
      name: r.name || 'Unknown',
      patient_id: r.patient_id || r.patientId || '',
      contact_number: r.contact_number || r.phone || '',
      date_of_birth: r.date_of_birth || null,
      gender: r.gender || 'Unknown',
      is_active: r.is_active !== undefined ? r.is_active : 1
    }))

    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching patients list:', error)
    
    // Return empty array instead of error to prevent UI crashes
    return NextResponse.json([])
  }
}
