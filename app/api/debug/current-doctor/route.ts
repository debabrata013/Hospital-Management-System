import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization token
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No auth token found' },
        { status: 401 }
      );
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    return NextResponse.json({
      success: true,
      token_payload: decoded,
      doctor_id: decoded.id,
      doctor_name: decoded.name,
      doctor_role: decoded.role
    });

  } catch (error) {
    console.error('Error getting current doctor:', error);
    return NextResponse.json(
      { error: 'Failed to get current doctor info', details: error.message },
      { status: 500 }
    );
  }
}
