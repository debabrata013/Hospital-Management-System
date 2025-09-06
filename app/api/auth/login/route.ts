
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import sequelize from '../../../../lib/sequelize'; // Adjust path
import User from '../../../../models/User'; // Adjust path

const loginSchema = z.object({
  login: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const NODE_ENV = process.env.NODE_ENV || 'development';

export async function POST(req: NextRequest) {
  try {
    // Note: It's generally better to sync the database at startup, not per-request.
    // await sequelize.sync(); 

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const { login, password } = parsed.data;

    const isEmail = login.includes('@');

    const user = await User.findOne({
      where: isEmail ? { email: login } : { phoneNumber: login },
      // FIX: Explicitly select the columns that exist in the database
      attributes: [
        'id', 
        'password', 
        'isActive', 
        'role', 
        'email', 
        'firstName', 
        'lastName',
        'phoneNumber'
      ]
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: "Account is inactive. Please contact support." },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    const cookie = serialize('auth-token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return new NextResponse(
      JSON.stringify({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json( 
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
