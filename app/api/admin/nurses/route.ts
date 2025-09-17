import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    // Fetch all nurses from users table only
    const nurses = await executeQuery(`
      SELECT 
        id,
        name,
        email,
        role,
        contact_number as mobile,
        created_at,
        updated_at
      FROM users 
      WHERE role = 'nurse'
      ORDER BY name ASC
    `);

    return NextResponse.json(nurses);
  } catch (error) {
    console.error('Error fetching nurses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nurses' },
      { status: 500 }
    );
  }
}
