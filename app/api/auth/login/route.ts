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
    const users = await executeQuery('SELECT * FROM Users WHERE email = ?', [email]);

    if (users.length === 0) {
      console.log(`Login attempt failed: User with email '${email}' not found.`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    console.log(`Login attempt: User '${email}' found. Comparing password...`);

    // 3. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`Login attempt failed: Invalid password for user '${email}'.`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    console.log(`Login successful for user '${email}'.`);

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
        user: { 
          id: user.id, 
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email, 
          role: user.role 
        },
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
