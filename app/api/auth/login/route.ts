import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/mysql-connection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 1. Validate input
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }

    // 2. Find the user by email
    const users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    // 3. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 4. Generate a JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // Use user.id for MySQL
      process.env.JWT_SECRET || 'your-default-secret',
      { expiresIn: '1h' }
    );

    // 5. Set the token as a secure, httpOnly cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 200 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
