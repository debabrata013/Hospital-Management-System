import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-connection'; // Corrected import path
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = 'patient' } = await request.json();

    // 1. Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Generate unique user_id
    const generateUserId = () => {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      const rolePrefix = role.substring(0, 2).toUpperCase();
      return `${rolePrefix}${timestamp}${random}`.toUpperCase();
    };

    const userId = generateUserId();

    // 5. Save the new user to the database
    const insertQuery = `
      INSERT INTO users (user_id, name, email, password_hash, role, contact_number, is_active, is_verified, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(insertQuery, [
      userId,
      name,
      email,
      hashedPassword,
      role,
      '0000000000', // Default contact number
      1, // is_active
      0  // is_verified (needs verification for new registrations)
    ]);

    // Prepare user data for the response (excluding password)
    const responseUser = {
      id: result.insertId,
      user_id: userId,
      name,
      email,
      role,
      is_active: true,
      is_verified: false
    };

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: responseUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
