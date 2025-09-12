import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth-middleware'
import { getConnection } from '@/lib/db/connection'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await authenticateUser(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    // Check if user is staff member (nurse, staff, etc.)
    if (!['staff', 'nurse', 'receptionist', 'cleaning_staff'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { patientId, vitals, notes } = body

    if (!patientId || !vitals) {
      return NextResponse.json({ error: 'Patient ID and vitals are required' }, { status: 400 })
    }

    const pool = getConnection();
    const connection = await pool.getConnection();

    try {
      // Update the most recent prescription with the new vitals data
      const [updateResult] = await connection.execute(`
        UPDATE prescriptions
        SET
          blood_pressure = ?,
          heart_rate = ?,
          temperature = ?,
          weight = ?,
          height = ?,
          updated_at = NOW()
        WHERE patient_id = ?
        ORDER BY created_at DESC
        LIMIT 1;
      `, [
        vitals.bloodPressure || null,
        vitals.heartRate || null,
        vitals.temperature || null,
        vitals.weight || null,
        vitals.height || null,
        patientId
      ]);

      if ((updateResult as any).affectedRows === 0) {
        return NextResponse.json({ success: false, error: 'No active prescription found for this patient to update.' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Vitals updated in the latest prescription successfully.'
      });
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (error) {
    console.error('Error recording vitals:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
