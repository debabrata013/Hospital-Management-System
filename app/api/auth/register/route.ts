import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-connection'; // Corrected import path
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

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

    // 4. Create the new user object
    const newUser = {
      name,
      email,
      passwordHash: hashedPassword,
      role: 'patient', // Default role
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 5. Save the new user to the database
    const insertQuery = 'INSERT INTO users (name, email, passwordHash, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const result = await executeQuery(insertQuery, [
      newUser.name,
      newUser.email,
      newUser.passwordHash,
      newUser.role,
      newUser.isActive,
      newUser.createdAt,
      newUser.updatedAt
    ]);

    // Prepare user data for the response (excluding password)
    const { passwordHash, ...userForResponse } = newUser;
    const responseUser = {
      id: result.insertId,
      ...userForResponse
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
